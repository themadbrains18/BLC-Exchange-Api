const db = require("../models");
const chats = db.chats;
const posts = db.posts;
const orders = db.orders;
const Notification = db.notifications;


exports.create = (req, res) => {

  try {
    const { post_id, from, to, orderid, message,buy_user_id,sell_user_id } = req.body;
    let chat = [];
    let obj = {};

    if (message !== '') {
      obj = { from, to, message }
      chat.push(obj);
    }

    chats.findOne({ orderid: orderid }).then((result) => {
      if (result) {
        let oldchat = result.chat;
        // oldchat.push(obj);
        const newArray = oldchat.concat(chat);
        // console.log(newArray,'new Array');
        result.update({ chat: newArray }).then((response) => {
          if (response) {
            let notifyObj = { sender: chat[0].from, receiver: chat[0].to, type: 'order', orderid: orderid, message: chat[0].message };
            Notification.create(notifyObj).then((notify) => {
              if (notify) {
                console.log('notification record saved');
              }
            })
            return res.send({ status: 200, data: response });
          }
        })
      }
      else {

        let createObj = { post_id, buy_user_id, sell_user_id, orderid, chat };
        chats.create(createObj).then(async (result) => {
          if (result) {
            let notifyObj = { sender: chat[0].from, receiver: chat[0].to, type: 'order', orderid: orderid, message: chat[0].message };
            console.log('=======notify object', notifyObj)
            Notification.create(notifyObj).then((notify) => {
              if (notify) {
                console.log('notification record saved');
              }
            })
            return res.send({ status: 200, data: result });
          }
        }).catch((error) => {
          console.log(error)
          return res.send({ status: 500, error });
        })
      }
    }).catch((error) => {
      console.log(error)
      return res.send({ status: 500, error });
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, error });
  }

}


exports.getChat = (req, res) => {
  try {
    
    chats.findAll({ where: { orderid: req.params.orderid } }).then(async (result) => {
      if (result) {
        return res.send({ status: 200, data: result });
      }
      else {
        return res.send({ status: 200, data: {} });
      }
    })
  } catch (error) {
    return res.send({ status: 500, error });
  }
}

exports.getNotification = (req, res) => {
  try {
    Notification.findAll({ where: { receiver: req.params.userid, status: 'active' } }).then((data) => {
      if (data) {
        return res.send({ status: 200, data: data });
      }
    })
  } catch (error) {

  }
}

exports.changeNotificationStatus = (req, res) => {
  try {
    Notification.update({ status: 'inactive' }, { where: { id: req.params.id } }).then((data) => {
      if (data) {
        return res.send({ status: 200, message: 'Notification status update' });
      }
    })
  } catch (error) {

  }
}


exports.socketChat = (socket, body) => {
  console.log(body,'=============body');
  try {
    try {
      chats.findOne({ where: { orderid: body.orderid } }).then(async (result) => {
        if (result) {
          socket.broadcast.emit("chat", { result });
        }
        else {
          socket.broadcast.emit("chat", { result });
        }
      })
    } catch (error) {
      return res.send({ status: 500, error });
    }

    
  } catch (error) {
    console.error(error,'======chat erroe');
  }
}