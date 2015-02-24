if (typeof Chat12 === "undefined")
  Chat12 = {};

/**
 * Init Chat12
 * Options : {
 *  // send12XXXXAllow:
 *  // - who can use Chat121
 *  // - if targetUserId is undefined, return true if user can use the service
 *  send121Allow: function (userId, targetUserId) {},
 *  send12RoomAllow: function (userId, roomId) {},
 *  // createRoomAllow:
 *  // - who can create a room
 *  createRoomAllow: function (userId) {}, 
 *  // getContacts: return userIds array that can be seen by userId
 *  getContacts: function (userId) {},
 *  // getRooms: return roomIds array that can be seen by userId
 *  getRooms: function (userId) {},
 * }
 */
Chat12.init = function (options) {
  Chat12.allow = options.allow;
  Chat12.Chat121Msgs.sendAllow = options.send121Allow;
  Chat12.Chat12RoomMsgs.sendAllow = options.send12RoomAllow;
  // createAllow(userId, room)
  Chat12.Chat12Rooms.createAllow = options.createRoomAllow;
  // getContacts = function ([userId])
  // Location : Client + Server
  // Params :
  // - userId: String, optional : user from who you want chat contacts
  // Return: array of users Ids than we can chat to
  // Must be client + server function
  Chat12.getContacts = options.getContacts;
  // getContactsFileds
  // Location: Server
  // Format: same as find format => {fieldName: Boolean}
  // Allow you to add fields mendatory for your listing name template
  if (Meteor.isServer)
    Chat12.getContactsFields = options.getContactsFields ? options.getContactsFileds : {};
  if (Meteor.isClient) {
    Chat12.getContactName = options.getContactName;
    Chat12.getContactPortrait = options.getContactPortrait;
    Chat12.getContactDescription = options.getContactDescription;
    Chat12.getContactOrder = options.getContactOrder;
    Chat12.getContactsListClass = options.getContactsListClass;
    Chat12.getRoomPortrait = options.getRoomPortrait;
    Chat12.onMsgCallBack = options.onMsgCallBack;
  }
/*  Chat12.getRooms = options.getRooms;*/
}

Chat12.getRooms = function (userId) {
  return Chat12.Chat12Rooms.find({
    $or: [{participants: {$in: [userId]}}, {creator: userId}],
    closed: false
  }).map(function (room) {return room._id});
}

/**
 * Generic CallBack
 */
Chat12.callbackGeneric = function (err, res) {
    if (typeof err !== "undefined")
      console.log(err);
};

/**
 * Methodes Wrappers
 */
Chat12.Chat121Send = function (targetUserId, msg) {
  Meteor.call('Chat121Send', targetUserId, msg, Chat12.callbackGeneric);
};
Chat12.Chat121SetRead = function (from) {
  Meteor.call('Chat121SetRead', from, Chat12.callbackGeneric);
};
Chat12.Chat12RoomSend = function (roomId, msg) {
  Meteor.call('Chat12RoomSend', roomId, msg, Chat12.callbackGeneric);
};
Chat12.Chat12RoomSetRead = function (roomId) {
  Meteor.call('Chat12RoomSetRead', roomId, Chat12.callbackGeneric);
};
Chat12.Chat12CreateRoom = function (name, private, participants) {
  Meteor.call('Chat12CreateRoom', name, private, participants, Chat12.callbackGeneric);
};
Chat12.Chat12InviteToRoom = function (roomId, invitedUserId) {
  Meteor.call('Chat12InviteToRoom', roomId, invitedUserId, Chat12.callbackGeneric);
};
Chat12.Chat12JoinRoom = function (roomId) {
  Meteor.call('Chat12JoinRoom', roomId, Chat12.callbackGeneric);
};
Chat12.Chat12LeaveRoom = function (roomId) {
  Meteor.call('Chat12LeaveRoom', roomId, Chat12.callbackGeneric);
};

/**
 * Methodes
 */
Meteor.methods({
  /**
   * Messages
   */
  Chat121Send: function (targetUserId, msg) {
    var self = this;
    if (Chat12.Chat121Msgs.sendAllow(this.userId, targetUserId, self))
      Chat12.Chat121Msgs.insert({from: this.userId, to: targetUserId, msg: msg});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to send a message to this user' );
  },
  Chat121SetRead: function (from) {
    Chat12.Chat121Msgs.update({
      from: from,
      to: this.userId,
      readBy: {$nin: [this.userId]}
    }, {
      $push: {readBy: this.userId}
    }, {multi: true});
  },
  /**
   * Rooms methodes
   */
  Chat12RoomSend: function (roomId, msg) {
    var self = this;
    if (Chat12.Chat12RoomMsgs.sendAllow(this.userId, roomId, self))
      Chat12.Chat12RoomMsgs.insert({from: this.userId, room: roomId, msg: msg},
                                  function (err, res) {if (err) console.log(err)});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to send a message to this room' );
  },
  Chat12RoomSetRead: function (roomId) {
    Chat12.Chat12RoomMsgs.update({
      room: roomId,
      readBy: {$nin: [this.userId]}
    }, {
      $push: {readBy: this.userId}
    }, {multi: true});
  },
  Chat12CreateRoom: function (name, private, participants) {
    if (Chat12.Chat12Rooms.createAllow(this.userId, name, private, participants))
      Chat12.Chat12Rooms.insert({
        creator: this.userId, name: name, private: private, participants: participants
      },
      function (err, res) {console.log(err)});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to create this Room' );
  },
  /**
   * Invite to room. You need:
   * - existing room
   * - be in the room
   * - can see the invited user
   */
  Chat12InviteToRoom: function (roomId, invitedUserId) {
    var self = this;
    var room = Chat12.Chat12Rooms.findOne({_id: roomId});
    if (room && room.participants.contains(invitedUserId) && Chat12.getContacts(userId, self).contains(invitedUserId))
      Chat12.Chat12Rooms.update({_id: roomId}, {$push: {participants: invitedUserId}});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to add user to this room' );
  },
  /**
   * Join a room. You need:
   * - a public room
   */
  Chat12JoinRoom: function (roomId) {
    var room = Chat12.Chat12Rooms.findOne({_id: roomId});
    if (room && !room.private)
      Chat12.Chat12Rooms.update({_id: roomId}, {$push: {participants: invitedUserId}});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to enter this room, you need to be invited' );
  },
  Chat12LeaveRoom: function (roomId) {
    var room = Chat12.Chat12Rooms.findOne({_id: roomId});
    if (room)
      Chat12.Chat12Rooms.update({_id: roomId}, {$pull: {participants: this.userId}});
  }
});
