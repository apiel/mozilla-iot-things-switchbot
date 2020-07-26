const {
    Property,
    SingleThing,
    Thing,
    Value,
    WebThingServer,
} = require('webthing');

const Switchbot = require('switchbot');
const switchbot = Switchbot('F4:CD:C6:01:F4:97');

function makeThing() {
    const thing = new Thing(
        'urn:dev:ops:my-switchbot-1234',
        'Switchbot',
        ['OnOffSwitch'],
        'Trigger Switchbot',
    );

    thing.addProperty(
        new Property(
            thing,
            'on',
            new Value(true, (on) => {
                console.log(`change: ${on}`);
                if (on) {
                    switchbot.press().then(() => {
                        console.log('press done');
                        thing.setProperty('on', false);
                    });
                }
            }),
            {
                '@type': 'OnOffProperty',
                title: 'Switchbot',
                type: 'boolean',
                description: 'Press switchbot',
            },
        ),
    );
    return thing;
}

function runServer() {
    const thing = makeThing();
    const server = new WebThingServer(new SingleThing(thing), 8888);
    process.on('SIGINT', () => {
        server
            .stop()
            .then(() => process.exit())
            .catch(() => process.exit());
    });
    server.start().catch(console.error);
}

runServer();
