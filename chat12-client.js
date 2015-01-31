Template.registerHelper('chat12Allow', function () {
  return Chat12.allow();
});

Template.registerHelper('chat121SendAllow', function () {
  return Chat12.Chat121Msgs.sendAllow();
});

Template.registerHelper('chat12RoomCreateAllow', function () {
  return Chat12.Chat12Rooms.createAllow();
});
