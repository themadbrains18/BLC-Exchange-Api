module.exports = {
  HOST: "localhost", //localhost
  USER: "root",
  PASSWORD: '123456',// "tmb@2018#2",
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
  SMTP_USER: 'surinderdhanjufss@gmail.com',//'blcexchange.net@gmail.com' ,
  SMTP_PASSWORD: 'lmmyrkpjsebbdgoj',//'yeaqfufvtyybzggm' ,
  SMTP_SECURE: false,
  web3Provider: "https://data-seed-prebsc-1-s1.binance.org:8545/"
};
