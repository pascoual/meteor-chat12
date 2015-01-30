if (typeof Chat12 === "undefined")
  Chat12 = {};

/**
 * Collections
 */
Chat12.Chat121Msgs = new Mongo.Collection("chat121Msgs");
Chat12.Chat12RoomMsgs = new Mongo.Collection("Chat12RoomMsgs");
Chat12.Chat12Rooms = new Mongo.Collection("chat12Rooms");

/**
 * Common definition
 */
Chat12.Common = {
  schema: {
  },
  denyAll: {
    insert: function (userId, doc) {
      // Never allow insert from client
      return true;
      // In case of anonymus post, it works if from is undefined (has
      // userId...)
      //return doc.from !== userId;
    },
    update: function (userId, docs, fields, modifier) {
      // Never allow update msg from client
      return true;
    },
    remove: function (userId, doc) {
      // Never allow remove msg from client
      return true;
    }
  }
};

/**
 * Rights
 * See Chat12.init methode that help to add allow rules
 */
Chat12.Chat121Msgs.deny(Chat12.Common.denyAll);
Chat12.Chat12RoomMsgs.deny(Chat12.Common.denyAll);
Chat12.Chat12Rooms.deny(Chat12.Common.denyAll);

/**
 * Schema : Chat121Msgs
 */
Chat12.Chat121Msgs.attachSchema(new SimpleSchema({
    from: {
      type: String,
      label: "From"
    },
  to: {
    type: String,
    label: "To"
  },
    msg: {
      type: String,
      label: "Message",
      max: 512
    },
    date: {
      type: Date,
      label:"Date",
      autoValue: function() {
        if (this.isInsert) {
          return new Date;
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date};
        } else {
          this.unset();
        }
      }
    },
    readBy: {
      type: [String],
      label: "ReadBy",
      min: 0,
      autoValue: function() {
        if (this.isInsert) {
          return [];
        }
      }
    }
}));

/**
 * Schema : Chat12RoomMsgs
 */
Chat12.Chat12RoomMsgs.attachSchema(new SimpleSchema({
    from: {
      type: String,
      label: "From"
    },
  room: {
    type: String,
    label: "To"
  },
    msg: {
      type: String,
      label: "Message",
      max: 512
    },
    date: {
      type: Date,
      label:"Date",
      autoValue: function() {
        if (this.isInsert) {
          return new Date;
        } else if (this.isUpsert) {
          return {$setOnInsert: new Date};
        } else {
          this.unset();
        }
      }
    },
    readBy: {
      type: [String],
      label: "ReadBy",
      min: 0
    }
}));

/**
 * Schema : Chat12Rooms
 */
Chat12.Chat12Rooms.attachSchema(new SimpleSchema({
  creator: {
    type: String,
    label: "Creator",
    autoValue: function() {
      if (this.isInsert) {
        return Meteor.userId();
      } else if (this.isUpsert) {
        return {$setOnInsert: this.userId()};
      } else {
        this.unset();
      }
    }
  },
  name: {
    type: String,
    label: "Name",
    min: 3,
    max: 24
  },
  desc: {
    type: String,
    label: "Description",
    min: 3,
    max: 24
  },
  private: {
    type: Boolean,
    label: "Private"
  },
  participants: {
    type: [String],
    label: "Participants",
    autoform: {
      options: function() {
        return Meteor.users.find({_id: {$in: Chat12.getContacts()}}, {sort: Chat12.getContactOrder()}).map(function (user) {
          return {
            label: user.profile.name,
            value: user._id
          }
        });
      }
    }
  },
  creationDate: {
    type: Date,
    label: "Creation date",
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  },
  closed: {
    type: Boolean,
    label: "Closed",
    defaultValue: false
  }
}));
