Meteor.publish("chat12GetOnes", function () {
  if (!this.userId)
    return;
  var myFields = _.extend({"status.online": 1}, Chat12.getContactsFileds);
  return Meteor.users.find({_id: {$in: Chat12.getContacts(this.userId)}}, {fields : myFields});
});
