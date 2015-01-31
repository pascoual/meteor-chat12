Package.describe({
  summary: "Chat12 is a chat package allowing 121 (OneToOne), 12PR (OneToPrivateRoom from invitation) and 12R (OneToRoom public room).",
  version: "0.1.0",
  git: "https://github.com/pascoual/meteor-chat12"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.0');

  api.use(['underscore','mongo', 'aldeed:simple-schema','aldeed:collection2','aldeed:autoform','mizzao:user-status@0.6.3']);
  api.use('templating', 'client');

  api.add_files(['chat12-client.js'], 'client');
  api.add_files(['chat12-server.js'], 'server');
  api.add_files(['chat12-collections.js']);
  api.add_files(['chat12-common.js']);

  api.export('Chat12');
});
