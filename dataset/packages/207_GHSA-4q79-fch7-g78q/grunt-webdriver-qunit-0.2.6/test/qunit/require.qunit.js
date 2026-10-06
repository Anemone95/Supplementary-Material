QUnit.jUnitReport = function(report) {
  var div = document.getElementById('qunit-xml');
  if (!div) {
    div = document.createElement('div');
    div.id = 'qunit-xml';
    document.body.appendChild(div);
  }
  div.innerHTML = report.xml;
};
