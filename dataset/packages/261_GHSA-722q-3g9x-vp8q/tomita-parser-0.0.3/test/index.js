var Lab = require('lab');
var Code = require('code');

// Test shortcuts
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('Tomita search', function() {

  var Tomita = require('../index');

  it('Найти дату', function(done) {

    new Tomita('Юрий Алексеевич Гагарин родился в пятницу, 9 марта 1934 года.', __dirname + '/config1/config.proto', function (err, data) {
      //console.dir(data);
      if (err) {
        done(err);
      } else {
        expect(data.Date.Day.$.val).to.equal('9');
        expect(data.Date.Month.$.val).to.equal('МАРТ');
        expect(data.Date.Year.$.val).to.equal('1934 ГОДА');

        done();
      }
    });

  }); 

   it('Найти где и когда', function(done) {

    new Tomita('У лисицы 15 мая, Подкрепился у лисицы 14 августа', __dirname + '/config2/config.proto', function (err, data) {
      //var k , i = 0;
      //for (k in data) {
      //  console.dir(data.Date[i++].Day.$.val);
      //}
      if (err) {
        done(err);
      } else {
        expect(data.Sparrow[1].Who.$.val).to.equal('ЛИСИЦА');
        expect(data.Sparrow[1].When.$.val).to.equal('14 АВГУСТА');
        expect(data.Sparrow[0].When.$.val).to.equal('15 МАЯ');
        expect(data.Date[1].Day.$.val).to.equal('14');
        expect(data.Date[0].Month.$.val).to.equal('МАЙ');

        done();
      }
    });

  }); 

  it('Invalid config.proto path', function(done) {
    new Tomita('', 'invalid.proto', function (err, data) {
      expect(err).not.to.equal(null);
      done();
    });
  });

});