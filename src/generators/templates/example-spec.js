describe('Example', function(){

  it('is true that it works', function(done){
    composr.Phrase.runByPath(domain, 'example/two', 'get')
      .then(function(response){
        expect(response.body.hello).to.equals('world');
        done();
      })
      .catch(done);
  });
});