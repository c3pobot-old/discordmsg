'use strict'
module.exports = async(sId)=>{
  try{
    if(+process.env.NUM_SHARDS > 0 && sId > 0){
      let shardId = 0
      shardId = (Number(BigInt(sId) >> 22n) % (+process.env.NUM_SHARDS))
      return shardId.toString()
    }
  }catch(e){
    console.error(e)
  }
}
