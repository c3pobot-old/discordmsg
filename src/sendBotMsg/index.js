const ReportError = require('./reportError')
const SendRequest = require('./sendRequest')
module.exports = async(opts = {}, data = {})=>{
  try{
    let payload = {...opts, ...data}
    if(+opts.shardId >= 0) payload.podName = 'bot-'+opts.shardId
    payload.cmd = payload.method

    let res = await SendRequest(payload)
    if(res?.error) ReportError(res.error, payload)
    return res
  }catch(e){
    console.error(e);
    console.log(opts)
    console.log(opts.podName)
    console.log(data.method)
  }
}
