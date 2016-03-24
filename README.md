# @leisurelink/skinny-event-loggins

Simple event-based logger designed to be easily plugged into a different logging framework.

## Design goals

No dependencies, pure emit of log events, simple to use.

## Sample Usage

```javascript
const Logger = require('@leisurelink/skinny-event-loggins');
const log = Logger('my-namespace');
const realLogger = require('winston');

log.sink.on('log', function(ev){
  realLogger[ev.kind](ev.namespace + ' - ' + ev.message, ev.err);
});

//...
log.silly('Extremely detailed log message', result);
```

## API

### Logger(namespace, eventSink)
Create a logger with the specified namespace (optional) and the specified event sink (optional). Returns an object with these methods:

### [silly|debug|verbose|info|warn|error(message, err)
Log a message of the specified level with optional error

### withNamespace(namespace, separator)
Creates a child logger with the specified namespace. If the current logger has a namespace, the new namespace is created to look like 'old:new'. Use the `separator` parameter to specify a different separator than ':'. If `separator === false`, then the new namespace will not include the old.
