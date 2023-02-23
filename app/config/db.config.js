module.exports = {
  HOST: "127.0.0.1", //localhost
  USER: "root",
  PASSWORD: '@Dmin#2019$',// "123456",
  DB: "blc",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: '587',
  SMTP_SECURE_TYPE: 'Tls',
  //SMTP_USER: 'blcexchange.net@gmail.com',// 'surinderdhanjufss@gmail.com',
  //SMTP_PASSWORD: 'yeaqfufvtyybzggm',// 'lmmyrkpjsebbdgoj',
  SMTP_USER: 'surinderdhanjufss@gmail.com',//'blcexchange.net@gmail.com' ,
  SMTP_PASSWORD: 'lmmyrkpjsebbdgoj',//'yeaqfufvtyybzggm' ,
  SMTP_SECURE: false,
  web3Provider: "https://data-seed-prebsc-1-s1.binance.org:8545/"
};
