use("codecraft")

// const docs = db.challenges.find().toArray()
// const idMap = new Map()

// docs.forEach((doc) => {
//     const oldId = doc._id
//     const nextId = new ObjectId() // generate new ObjectId

//     doc._id = nextId
//     doc.originalId = oldId // optional backup
//     idMap.set(String(oldId), nextId)

//     db.challenges_new.insertOne(doc)
// })

// // Remap user completion references to the new challenge ObjectIds.
// db.users.find().forEach((user) => {
//     const existing = Array.isArray(user.completedChallenges) ? user.completedChallenges : []

//     const remapped = existing
//         .map((value) => idMap.get(String(value)))
//         .filter((value) => Boolean(value))

//     db.users.updateOne(
//         { _id: user._id },
//         {
//             $set: {
//                 completedChallenges: remapped,
//             },
//         },
//     )
// })

// // Replace collection
// db.challenges.drop()
// db.challenges_new.renameCollection("challenges")

db.challenges.find({})
