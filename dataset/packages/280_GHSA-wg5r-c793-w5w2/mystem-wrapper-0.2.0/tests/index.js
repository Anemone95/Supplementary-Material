var should = require('should');
var mystem = require('../')();

describe('mystem', function () {
	it('should analyze cyrillic sentences', function (done) {
		mystem.analyze('Жили были').then(function (result) {
			result.should.have.lengthOf(2);
			result[0].analysis[0].lex.should.eql('жить');
			result[0].analysis[0].gr.should.startWith('V');
			result[1].text.should.eql('были');
			return mystem.close();
		}).then(done).catch(done);
	});
});
