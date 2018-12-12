const faker = require('faker')
const models = require('./models')

const owner = '5bf59866e4ef1113c48ed8c7'

module.exports = async () => {
    try {
        models.Post.remove()
        Array.from({length: 20}).forEach(async () => {
            const post =  await models.Post.create({
                title: faker.lorem.words(5),
                body: faker.lorem.words(100),
                owner
            }).then(console.lo).catch(console.log)
        })
    }catch (e) {
      console.log(e)
    }

}