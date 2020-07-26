const {
  Property,
  SingleThing,
  Thing,
  Value,
  WebThingServer,
} = require("webthing");

const Switchbot = require("switchbot");
const switchbot = Switchbot("F4:CD:C6:01:F4:97");

function makeThing() {
  const thing = new Thing(
    "urn:dev:ops:my-actuator-1234",
    "ActuatorExample",
    ["OnOffSwitch"],
    "An actuator example that just log"
  );

  thing.addProperty(
    new Property(
      thing,
      "on",
      new Value(true, (update) => {
        console.log(`change: ${update}, should press`);
        switchbot.press();
      }),
      {
        "@type": "OnOffProperty",
        title: "On/Off",
        type: "boolean",
        description: "Whether the output is changed",
      }
    )
  );
  return thing;
}

function runServer() {
  const port = process.argv[2] ? Number(process.argv[2]) : 8888;
  const url = `http://localhost:${port}/properties/on`;

  console.log(`Usage:\n
${process.argv[0]} ${process.argv[1]} [port]
Try:
curl -X PUT -H 'Content-Type: application/json' --data '{"on": true }' ${url}
`);

  const thing = makeThing();
  const server = new WebThingServer(new SingleThing(thing), port);
  process.on("SIGINT", () => {
    server
      .stop()
      .then(() => process.exit())
      .catch(() => process.exit());
  });
  server.start().catch(console.error);
}

runServer();
