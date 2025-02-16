/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2512002833")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number4151017015",
    "max": null,
    "min": null,
    "name": "no_of_special_characters",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number595597769",
    "max": null,
    "min": null,
    "name": "no_of_numbers",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2512002833")

  // remove field
  collection.fields.removeById("number4151017015")

  // remove field
  collection.fields.removeById("number595597769")

  return app.save(collection)
})
