const GetShardId = require('./getShardId')
const ReportError = require('./reportError')
const SendRequest = require('./sendRequest')
const botUrl = require('./getBotUrl')
module.exports = async(opts = {}, data = {})=>{
  try{
    let shardId = opts.shardId
    if(!botUrl || !data.msg) return
    if(!(+shardId >= 0)) shardId = await GetShardId(opts.sId)
    if(!botUrl[shardId]) return
    const res = await SendRequest(botUrl[shardId], data)
    if(res?.error) ReportError(res.error, opts, data)
    return res?.body
  }catch(e){
    console.error(e);
  }
}
