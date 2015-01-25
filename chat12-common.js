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
 *  // getOnes: return userIds array that can be seen by userId
 *  getOnes: function (userId) {},
 *  // getRooms: return roomIds array that can be seen by userId
 *  getRooms: function (userId) {},
 * }
 */
Chat12.init = function (options) {
  Chat12.Chat121Msgs.sendAllow = options.send121Allow;
  Chat12.Chat12RoomMsgs.sendAllow = options.send12RoomAllow;
  Chat12.Chat12Rooms.createAllow = options.createRoomAllow;
  Chat12.getOnes = options.getOnes;
  Chat12.getRooms = options.getRooms;
}

/**
 * Generic CallBack
 */
Chat12.callbackGeneric = function (err, res) {
    if (typeof err !== undefined)
      console.log(err);
};

/**
 * Methodes Wrappers
 */
Chat12.Chat121Send = function (targetUserId, msg) {
  Meteor.call('Chat121Send', targetUserId, msg, Chat12.callbackGeneric);
};
Chat12.Chat12RoomSend = function (roomId, msg) {
  Meteor.call('Chat12RoomSend', roomId, msg, Chat12.callbackGeneric);
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
    if (Chat12.Chat121Msgs.sendAllow(this.userId, targetUserId))
      Chat12.Chat121Msgs.insert({from: this.userId, to: targetUserId, msg: msg});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to send a message to this user' );
  },
  Chat12RoomSend: function (roomId, msg) {
    if (Chat12.Chat12RoomMsgs.sendAllow(this.userId, roomId))
      Chat12.Chat12RoomMsgs.insert({from: this.userId, room: roomId, msg: msg});
    else
      throw new Meteor.Error( 500, 'You don\'t have right to send a message to this room' );
  },
  /**
   * Rooms methodes
   */
  Chat12CreateRoom: function (name, private, participants) {
    if (Chat12.Chat12Rooms.createAllow(this.userId, name, private, participants))
      Chat12.Chat12Rooms.insert({creator: this.userId, name: name, private: private, participants: participants});
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
    var room = Chat12.Chat12Rooms.findOne({_id: roomId});
    if (room && room.participants.contains(invitedUserId) && Chat12.getOnes(userId).contains(invitedUserId))
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