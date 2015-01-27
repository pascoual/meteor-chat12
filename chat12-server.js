/**
 * Publish
 */

Meteor.publish("chat12GetOnes", function () {
  if (!this.userId)
    return;
  var myFields = _.extend({"status.online": 1}, Chat12.getContactsFileds);
  return Meteor.users.find({_id: {$in: Chat12.getContacts(this.userId)}}, {fields : myFields});
});

Meteor.publish("chat12GetMessages", function (to, msgNb) {
  var limit = msgNb ? msgNb : 100;
  return Chat12.Chat121Msgs.find({$or: [{from: this.userId, to: to}, {from: to, to: this.userId}]}, {sort: {date: -1}, limit: limit});
});
