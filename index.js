const {
    Property,
    SingleThing,
    Thing,
    Value,
    WebThingServer,
    Event,
} = require('webthing');

const Switchbot = require('switchbot');
const switchbot = Switchbot('F4:CD:C6:01:F4:97');

class SwitchbotThing extends Thing {
    constructor() {
        super(
            'urn:dev:ops:my-switchbot-1234',
            'Switchbot',
            ['OnOffSwitch'],
            'Trigger Switchbot',
        );

        const onChange = async (on) => {
            console.log(`change: ${on}`);
            if (on) {
                try {
                    // throw new Error('test error');
                    await switchbot.press();
                    console.log('press done');
                    this.setProperty('on', false);
                } catch (error) {
                    console.error(error.toString());
                    this.addEvent(new Event(this, 'failed', error.toString()));
                }
            }
        };

        this.addProperty(
            new Property(this, 'on', new Value(true, onChange), {
                '@type': 'OnOffProperty',
                title: 'Switchbot',
                type: 'boolean',
                description: 'Press switchbot',
            }),
        );

        this.addAvailableEvent('failed', {
            description: 'Something went wrong with switchbot. Try again...',
            type: 'string',
        });
    }
}

function runServer() {
    const switchbotThing = new SwitchbotThing();
    const server = new WebThingServer(new SingleThing(switchbotThing), 8888);
    process.on('SIGINT', () => {
        server
            .stop()
            .then(() => process.exit())
            .catch(() => process.exit());
    });
    server.start().catch(console.error);
}

runServer();
