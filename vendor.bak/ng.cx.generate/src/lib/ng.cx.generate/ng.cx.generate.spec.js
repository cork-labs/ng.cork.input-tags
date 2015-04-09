describe('ng.cx.generate', function () {
    'use strict';

    beforeEach(module('ng.cx.generate'));

    describe('cxGenerate', function () {

        describe('uuid()', function () {

            it('should generate strings.', inject(function (cxGenerate)  {

                expect(typeof cxGenerate.uuid()).toBe('string');
            }));

            it('should generate valid rfc4122 uuids.', inject(function (cxGenerate)  {

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    // note: it always generates lowercase strings
                    expect(cxGenerate.uuid()).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/);
                }
            }));
        });

        describe('hex()', function () {

            it('should generate strings.', inject(function (cxGenerate)  {

                expect(typeof cxGenerate.hex()).toBe('string');
            }));

            it('should generate strings with provided length, containing only hex chars.', inject(function (cxGenerate)  {

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    expect(cxGenerate.hex(ix)).toMatch(new RegExp('^[a-f0-9]{' + ix + '}$'));
                }
            }));

            it('should prefix generated strings with provided prefix.', inject(function (cxGenerate)  {

                var prefix = 'foobar';

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    expect(cxGenerate.hex(ix, prefix)).toMatch(new RegExp('^' + prefix + '-[a-f0-9]{' + ix + '}$'));
                }
            }));
        });

        describe('sequence()', function () {

            it('should generate strings.', inject(function (cxGenerate)  {

                expect(typeof cxGenerate.sequence()).toBe('string');
            }));

            it('should generate strings with provided length, containing only hex chars.', inject(function (cxGenerate)  {

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    expect(cxGenerate.sequence()).toMatch(new RegExp('^[A-Z0-9]{3}$'));
                }
            }));

            it('should prefix generated strings with provided prefix.', inject(function (cxGenerate)  {

                var prefix = 'foobar';

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    expect(cxGenerate.sequence(prefix)).toMatch(new RegExp('^' + prefix + '-[A-Z0-9]{3}$'));
                }
            }));

            it('should increase the sequence length after it reaches "ZZZ".', inject(function (cxGenerate)  {

                var str;
                while (str !== 'ZZZ') {
                    str = cxGenerate.sequence();
                }
                expect(cxGenerate.sequence()).toBe('0000');
            }));
        });

        describe('index()', function () {

            it('should generate numbers.', inject(function (cxGenerate)  {

                expect(typeof cxGenerate.index()).toBe('number');
            }));

            it('should start at 0 and increment (untill..).', inject(function (cxGenerate)  {

                var ix;
                for (ix = 0; ix < 30; ix++) {
                    expect(cxGenerate.index()).toBe(ix);
                }
            }));
        });
    });
});

