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
  return Chat12.Chat121Msgs.find({from: {$in: Chat12.getContacts(this.userId)}, to: this.userId, readBy: {$nin: [this.userId]}, removed: {$ne: true}});
});

/**
 * Get message for a specific contact.
 */
Meteor.publish("chat12GetMessages", function (to, msgNb) {
  if (!this.userId || !to)
    return;
  var limit = msgNb ? msgNb : 100;
  return Chat12.Chat121Msgs.find({$or: [{from: this.userId, to: to}, {from: to, to: this.userId}], removed: {$ne: true}}, {sort: {date: -1}, limit: limit});
});

/**
 * Get All Room :
 * - I'm in
 * - I have created
 */
Meteor.publish("chat12GetRooms", function () {
  if (this.userId)
    return Chat12.Chat12Rooms.find({$or: [{participants: {$in: [this.userId]}}, {creator: this.userId}], closed: false});
});

/**
 * Get message for a specific room.
 */
Meteor.publish("chat12GetRoomMessages", function (roomId, msgNb) {
  if (!this.userId || !roomId)
    return;
  var limit = msgNb ? msgNb : 100;
  /*var myRoomsIds = Chat12.Chat12Rooms.find({
    $or: [{participants: {$in: [this.userId]}}, {creator: this.userId}],
    closed: false
  }).map(function (room) {return room._id});*/
  return Chat12.Chat12RoomMsgs.find({room: roomId, removed: {$ne: true}}, {sort: {date: -1}, limit: limit});
});

/**
 * Get all Rooms unread message I'm in
 * Used to pop chat div when message comes.
 */
Meteor.publish("chat12GetRoomUnreadMessages", function () {
  if (!this.userId)
    return;
  return Chat12.Chat12RoomMsgs.find({room: {$in: Chat12.getRooms(this.userId)}, readBy: {$nin: [this.userId]}});
});
