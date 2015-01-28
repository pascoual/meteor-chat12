/**
 * Publish
 */

/**
 * Get user contacts
 */
Meteor.publish("chat12GetOnes", function () {
  if (!this.userId)
    return;
  var myFields = _.extend({"status.online": 1}, Chat12.getContactsFileds);
  return Meteor.users.find({_id: {$in: Chat12.getContacts(this.userId)}}, {fields : myFields});
});

/**
 * Get all unread message from all user contacts.
 * Used to pop chat div when message comes.
 */
Meteor.publish("chat12GetUnreadMessages", function () {
  if (!this.userId)
    return;
  return Chat12.Chat121Msgs.find({from: this.userId, to: {$in: Chat12.getContacts(this.userId)}, readBy: {$nin: [this.userId]}});
});

/**
 * Get message for a specific contact.
 */
Meteor.publish("chat12GetMessages", function (to, msgNb) {
  if (!this.userId || !to)
    return;
  var limit = msgNb ? msgNb : 100;
  return Chat12.Chat121Msgs.find({$or: [{from: this.userId, to: to}, {from: to, to: this.userId}]}, {sort: {date: -1}, limit: limit});
});
