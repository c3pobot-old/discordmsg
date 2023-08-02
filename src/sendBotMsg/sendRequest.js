'use strict'
const fetch = require('./fetch')
const BOT_NODE_NAME_PREFIX = process.env.BOT_NODE_NAME_PREFIX || 'bot'
const BOT_SVC = process.env.BOT_SVC || 'bot:3000'

let BOT_TOTAL_SHARDS, notify = true, retryCount = 10
const getPodName = async(obj = {})=>{
  try{
    if(BOT_TOTAL_SHARDS === 1) return `${BOT_NODE_NAME_PREFIX}-0`
    if(+obj.shardId >= 0) return `${BOT_NODE_NAME_PREFIX}-${obj.shardId}`
    if(!obj.sId) return
    let id = (Number(BigInt(obj.sId) >> 22n) % (+BOT_TOTAL_SHARDS))
    if(id >= 0) return `${BOT_NODE_NAME_PREFIX}-${id}`
  }catch(e){
    throw(e);
  }
}
const requestWithRetry = async(uri, opts = {}, count = 0)=>{
  try{
    let res = await fetch(uri, opts)
    if(res?.error === 'FetchError'){
      if(count < retryCount){
        count++
        return await requestWithRetry(uri, opts, count)
      }else{
        throw(`tried request ${count} time(s) and errored with ${res.error} : ${res.message}`)
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
const allBotRequest = async(opts = {})=>{
  try{
    let array = [], res = [], i = BOT_TOTAL_SHARDS
    const singleBotRequest = async(shardId, opt = {})=>{
      try{
        let obj = await requestWithRetry(`http://${BOT_NODE_NAME_PREFIX}-${shardId}.${BOT_SVC}/cmd`, {...opt,...{ podName: `${BOT_NODE_NAME_PREFIX}-${shardId}` }})
        if(obj?.body) res.push(obj.body)
      }catch(e){
        throw(e);
      }
    }
    while(i--) array.push(singleBotRequest(i, opts))
    await Promise.all(array)
    return res
  }catch(e){
    throw(e)
  }
}
const monitorNumShards = async()=>{
  try{
    let opts = { timeout: 5000, compress: true, method: 'GET' }
    let res = await requestWithRetry(`http://${BOT_SVC}/getNumShards`, opts)
    if(res?.body?.totalShards && +res.body.totalShards > 0){
      if(BOT_TOTAL_SHARDS !== +res.body.totalShards){
        console.log(`Change in number of ${BOT_NODE_NAME_PREFIX} shards from ${BOT_TOTAL_SHARDS} to ${res.body.totalShards}`)
        BOT_TOTAL_SHARDS = res.body.totalShards
      }
    }
    setTimeout(monitorNumShards, 5000)
  }catch(e){
    setTimeout(monitorNumShards, 5000)
    throw(e)
  }
}
monitorNumShards()
module.exports = async(cmd, opts = {})=>{
  try{
    if(!cmd || !BOT_TOTAL_SHARDS) return
    let podName = opts.podName
    console.log('Pre: '+podName)
    if(!podName) podName = await getPodName(opts)
    console.log('Post: '+podName)
    if(!podName) throw('Error getting podName...')
    let payload = { method: 'POST', timeout: 60000, compress: true, headers: {"Content-Type": "application/json"} }
    payload.body = JSON.stringify({ ...opts, ...{ cmd: cmd, podName: podName } })
    if(podName === 'all') return await allBotRequest(payload)
    let res = await requestWithRetry(`http://${podName}.${BOT_SVC}/cmd`, payload)
    if(res?.body) return res.body
    throw(res)
  }catch(e){
    throw(e);
  }
}
