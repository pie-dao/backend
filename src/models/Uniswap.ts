import * as mongoose from 'mongoose';

export const callbackGenerator = (resolve, reject) => {
  return (err, result) => {
    if (err) reject(err)
    resolve(result);
  };
};

const uniswapSchema = new mongoose.Schema({
  address: { type: 'String' },
  block: { type: 'Number' },
  last_refreshed: { type: 'Date' },
  data: { type: [ 'Mixed' ] },
});

uniswapSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
  console.log('here');

  const one = await this.findOne(condition);
  console.log(one);
  return one || this.create(doc);
});

const UniswapModel = mongoose.model('Uniswap', uniswapSchema);

export { UniswapModel };
