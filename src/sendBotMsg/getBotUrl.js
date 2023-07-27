'use strict'
let botUrl
if(process.env.NUM_SHARDS && process.env.BOT_URL_PREFIX){
  botUrl = {}
  for(let i = 0;i<+process.env.NUM_SHARDS;i++){
    let url = process.env.BOT_URL_PREFIX+'-'+i
    if(process.env.BOT_URL_SUFFIX) url += process.env.BOT_URL_SUFFIX
    url += ':'+(process.env.BOT_URL_PORT || 3001)
    url += '/msg'
    botUrl[i] = url
  }
  console.log(botUrl)
}
module.exports = botUrl
