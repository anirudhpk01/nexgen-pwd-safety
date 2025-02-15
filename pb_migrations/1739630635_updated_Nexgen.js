/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3015887271")

  // remove field
  collection.fields.removeById("text1867541123")

  // remove field
  collection.fields.removeById("text858918954")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3015887271")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1867541123",
    "max": 0,
    "min": 0,
    "name": "LSH",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text858918954",
    "max": 0,
    "min": 0,
    "name": "sha1",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
