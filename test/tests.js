'use strict';

var Logger = require('../');
var EventEmitter = require('events').EventEmitter;

const KINDS = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

var chai = require('chai');
var expect = chai.expect;

describe('Logger', () => {
  var logger;
  var sink;

  before(() => {
    sink = new EventEmitter();
  });

  const checkSingle = (fn, check) => {
    return new Promise((resolve, reject) => {
      sink.once('log', (ev) => {
        try {
          check(ev);
          return resolve();
        } catch (e) {
          reject(e);
        }
        reject();
      });
      fn();
    });
  };

  describe('with no namespace', () => {
    before(() => {
      logger = Logger(null, sink);
    });

    describe('#withNamespace', () => {
      let namedLogger;
      before(() => {
        namedLogger = logger.withNamespace('bob');
      })

      it('the new logger should log with the correct namespace', () => {
        return checkSingle(()=>namedLogger.info('test'), (event) => {
          expect(event.namespace).to.equal('bob');
        });
      });

      it('should not change the original logger', () => {
        return checkSingle(()=>logger.info('test'), (event) => {
          expect(event.namespace).to.be.undefined;
        });
      });
    });

    for (let kind of KINDS) {
      describe(`#${kind}`, () => {
        it('should emit log event when no error is passed', () => {
          return checkSingle(() => logger[kind]('message'), (event) => {
            expect(event.kind).to.equal(kind);
            expect(event.message).to.equal('message');
            expect(event.namespace).to.be.undefined;
            expect(event.err).to.be.undefined;
          });
        });
        it('should emit log event when error is passed', () => {
          let error = new Error('badness');
          return checkSingle(() => logger[kind]('message', error), (event) => {
            expect(event.kind).to.equal(kind);
            expect(event.message).to.equal('message');
            expect(event.namespace).to.be.undefined;
            expect(event.err).to.equal(error);
          });
        });
      });
    }
  });

  describe('with a namespace', () => {
    before(() => {
      logger = Logger('original', sink);
    });

    describe('#withNamespace', () => {
      let namedLogger;
      before(() => {
        namedLogger = logger.withNamespace('bob');
      })

      it('the new logger should log with the correct namespace', () => {
        return checkSingle(()=>namedLogger.info('test'), (event) => {
          expect(event.namespace).to.equal('original.bob');
        });
      });

      it('should not change the original logger', () => {
        return checkSingle(()=>logger.info('test'), (event) => {
          expect(event.namespace).to.equal('original');
        });
      });

      it('should be able to specify separator', () => {
        let otherLogger = logger.withNamespace('bob', '-');
        return checkSingle(()=>otherLogger.info('test'), (event) => {
          expect(event.namespace).to.equal('original-bob');
        });
      })

      it('should be able to specify that new namespace should replace old one', () => {
        let otherLogger = logger.withNamespace('bob', false);
        return checkSingle(()=>otherLogger.info('test'), (event) => {
          expect(event.namespace).to.equal('bob');
        });
      })
    });

    for (let kind of KINDS) {
      describe(`#${kind}`, () => {
        it('should emit log event', () => {
          return checkSingle(() => logger[kind]('message'), (event) => {
            expect(event.kind).to.equal(kind);
            expect(event.message).to.equal('message');
            expect(event.namespace).to.equal('original');
          });
        });
      });
    }
  });
});
