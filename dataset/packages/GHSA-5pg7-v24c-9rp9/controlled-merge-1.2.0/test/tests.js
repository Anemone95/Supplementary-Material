var expect = require('chai').expect,
	merge = require('../index.js');

describe('controlled-merge tests - no onConflict', function(){
	it('should throw an error if no objects are passed', function(){
		expect(function(){
			merge();
		}).to.throw();
	});
	
	it('should throw an error if there is only 1 argument passed, and it is not an object or function', function(){
		expect(function(){
			merge('test');
		}).to.throw();
	});
	
	it('should return the object if a singular object is passed', function(){
		expect(JSON.stringify(merge({ test: true }))).to.equal(JSON.stringify({ test: true }));
	});
	
	it('should return the object if a singular object in an array is passed', function(){
		expect(JSON.stringify(merge([{ test: true }]))).to.equal(JSON.stringify({ test: true }));
	});
	
	it('should merge multiple objects together', function(){
		expect(JSON.stringify(
			merge(
				{
					'test': true	
				},
				{
					'also': true
				},
				{
					'something': 'test'
				}
			))
		).to.equal(JSON.stringify(
			{
				'test': true,
				'also': true,
				'something': 'test'
			}
		));
	});
	
	it('should merge multiple objects together if passed an array', function(){
		expect(JSON.stringify(
			merge(
				[{
					'test': true	
				},
				{
					'also': true
				},
				{
					'something': 'test'
				}]
			))
		).to.equal(JSON.stringify(
			{
				'test': true,
				'also': true,
				'something': 'test'
			}
		));
	});
	
	it('should overwrite old values on newer object', function(){
		expect(JSON.stringify(
			merge(
				{
					'test': true	
				},
				{
					'test': 'overwritten'
				}
			))
		).to.equal(JSON.stringify(
			{
				'test': 'overwritten'
			}
		));
	});
});

describe('controlled-merge tests - onConflict set', function(){
	it('should call onConflict when there is a conflict', function(done){
		merge(function(){
			expect.ok;
			done();
		}, { 'test': true }, { 'test': false });
	});
	
	it('should not call onConflict if a conflict does not occur', function(done){
		var success = setTimeout(function(){
			expect.ok;
			done();
		}, 500);
		merge(function(){
			clearTimeout(success);
			expect.fail;
			done();
		}, { 'test': true }, { 'also': false });
	});
	
	it('should follow rules/returns from onConflict', function(){
		expect(JSON.stringify(
			merge(
				function(obj1, obj2){
					return "faked";
				},
				{
					'test': true
				},
				{
					'test': 1
				}
			)
		)).to.equal(JSON.stringify(
			{
				'test': 'faked'
			}
		));
	});
});