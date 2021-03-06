var should = require('should');
var Parser = process.env.L20N_COV
  ? require('../../build/cov/lib/l20n/parser').Parser
  : require('../../lib/l20n/parser').Parser;

describe('Example', function() {
  var parser;
  beforeEach(function() {
    parser = new Parser();
  });

  it('empty entity', function() {
    var ast = parser.parse('<id>');
    ast.body.length.should.equal(1);
    ast.body[0].type.should.equal('JunkEntry');
  });
  it('empty entity with white space', function() {
    var ast = parser.parse('<id >');
    ast.body.length.should.equal(1);
    ast.body[0].type.should.equal('JunkEntry');
  });
  it('string value', function() {
    var ast = parser.parse("<id 'string'>");
    ast.body.length.should.equal(1);
    ast.body[0].type.should.equal('Entity');
    ast.body[0].id.name.should.equal('id');
    ast.body[0].value.content.should.equal('string');

    var ast = parser.parse("<id '''string'''>");
    ast.body.length.should.equal(1);
    ast.body[0].type.should.equal('Entity');
    ast.body[0].id.name.should.equal('id');
    ast.body[0].value.content.should.equal('string');

    var ast = parser.parse('<id """string""">');
    ast.body.length.should.equal(1);
    ast.body[0].type.should.equal('Entity');
    ast.body[0].id.name.should.equal('id');
    ast.body[0].value.content.should.equal('string');

  });
  it('string value quotes', function() {
    //var ast = parser.parse('<id "str\\"ing">');
    //ast.body[0].value.content.should.equal('str"ing');

    //var ast = parser.parse("<id 'str\\'ing'>");
    //ast.body[0].value.content.should.equal("str'ing");

    //var ast = parser.parse('<id """str"ing""">');
    //ast.body[0].value.content.should.equal('str"ing');

    //var ast = parser.parse("<id '''str'ing'''>");
    //ast.body[0].value.content.should.equal("str'ing");

    var ast = parser.parse('<id """"string\\"""">');
    ast.body[0].value.content.should.equal('"string\\"');
    //ast.body[0].value.content.should.equal('"string"');

    //var ast = parser.parse("<id ''''string\\''''>");
    //ast.body[0].value.content.should.equal("'string'");

    //var ast = parser.parse("<id 'test \{{ more'>");
    //ast.body[0].value.content.should.equal("test {{ more");

    //var ast = parser.parse("<id 'test \\\\ more'>");
    //ast.body[0].value.content.should.equal("test \ more");

    //var ast = parser.parse("<id 'test \\a more'>");
    //ast.body[0].value.content.should.equal("test \\a more");*/
  });
  it('basic errors', function() {
    var strings = [
      '< "str\\"ing">',
      "<>",
      "<id",
      "<id ",
      "id>",
      '<id "value>',
      '<id value">',
      "<id 'value>",
      "<id value'",
      "<id'value'>",
      '<id"value">',
      '<id """value"""">',
      '< id "value">',
      '<()>',
      '<+s>',
      '<id-id2>',
      '<-id>',
      '<id 2>',
      '<"id">',
      '<\'id\'>',
      '<2>',
      '<09>',
    ];

    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }
  });
  it('basic attributes', function() {
    var ast = parser.parse("<id attr1: 'foo'>");
    ast.body[0].attrs.length.should.equal(1);
    ast.body[0].attrs[0].key.name.should.equal('attr1');
    ast.body[0].attrs[0].value.content.should.equal('foo');

    ast = parser.parse("<id attr1: 'foo' attr2: 'foo2'    >");
    ast.body[0].attrs.length.should.equal(2);
    ast.body[0].attrs[0].key.name.should.equal('attr1');
    ast.body[0].attrs[0].value.content.should.equal('foo');

    ast = parser.parse("<id attr1: 'foo' attr2: 'foo2' attr3: 'foo3' >");
    ast.body[0].attrs.length.should.equal(3);
    ast.body[0].attrs[0].key.name.should.equal('attr1');
    ast.body[0].attrs[0].value.content.should.equal('foo');
    ast.body[0].attrs[1].key.name.should.equal('attr2');
    ast.body[0].attrs[1].value.content.should.equal('foo2');
    ast.body[0].attrs[2].key.name.should.equal('attr3');
    ast.body[0].attrs[2].value.content.should.equal('foo3');

    ast = parser.parse("<id 'value' attr1: 'foo'>");
    ast.body[0].value.content.should.equal('value');
    ast.body[0].attrs[0].key.name.should.equal('attr1');
    ast.body[0].attrs[0].value.content.should.equal('foo');
  });
  it('attributes with indexes', function() {
    var ast = parser.parse("<id attr[2]: 'foo'>");
    ast.body[0].attrs[0].index[0].value.should.equal(2);

    ast = parser.parse("<id attr[2+3?'foo':'foo2']: 'foo'>");
    ast.body[0].attrs[0].index[0].test.left.value.should.equal(2);
    ast.body[0].attrs[0].index[0].test.right.value.should.equal(3);

    ast = parser.parse("<id attr[2, 3]: 'foo'>");
    ast.body[0].attrs[0].index[0].value.should.equal(2);
    ast.body[0].attrs[0].index[1].value.should.equal(3);
  });
  it('atribute errors', function() {
    var strings = [
      '<id : "foo">',
      "<id 2: >",
      "<id a: >",
      "<id: ''>",
      "<id a: b:>",
      "<id a: 'foo' 'heh'>",
      "<id a: 2>",
      "<id 'a': 'a'>",
      "<id \"a\": 'a'>",
      "<id 2: 'a'>",
      "<id a2:'a'a3:'v'>", 
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }
  });
  it('hash value', function() {
    var ast = parser.parse("<id {}>");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.length.should.equal(0);
    
    var ast = parser.parse("<id {a: 'b', a2: 'c', d: 'd' }>");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.length.should.equal(3);
    ast.body[0].value.content[0].value.content.should.equal('b');
    
    var ast = parser.parse("<id {a: '2', b: '3'} >");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.length.should.equal(2);
    ast.body[0].value.content[0].value.content.should.equal('2');
    ast.body[0].value.content[1].value.content.should.equal('3');
  });
  it('nested hash value', function() {
    var ast = parser.parse("<id {a: {}, b: { }}>");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.length.should.equal(2);
    ast.body[0].value.content[0].value.content.length.should.equal(0);
    
    ast = parser.parse("<id {a: 'foo', b: {a2: 'p'}}>");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.length.should.equal(2);
    ast.body[0].value.content[0].value.content.should.equal('foo');
    ast.body[0].value.content[1].value.content[0].key.name.should.equal('a2');
    ast.body[0].value.content[1].value.content[0].value.content.should.equal('p');
  });
  it('hash with default', function() {
    var ast = parser.parse("<id {a: 'v', *b: 'c'}>");
    ast.body[0].value.content[1].default.should.equal(true);
  });
  it('hash  errors', function() {
    var strings = [
      '<id {a: 2}>',
      "<id {a: 'd'>",
      "<id a: 'd'}>",
      "<id {{a: 'd'}>",
      "<id {a: 'd'}}>",
      "<id {a:} 'd'}>",
      "<id {2}>",
      "<id {'a': 'foo'}>",
      "<id {\"a\": 'foo'}>",
      "<id {2: 'foo'}>",
      "<id {a:'foo'b:'foo'}>",
      "<id {a }>",
      '<id {a: 2, b , c: 3 } >',
      '<id {*a: "v", *b: "c"}>',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }
  });
  it('index', function() {
    //var ast = parser.parse("<id[]>");
    //ast.body.length.should.equal(1);
    //ast.body[0].index.length.should.equal(0);
    //var ast = parser.parse("<id[ ] >");
    var ast = parser.parse("<id['foo'] 'foo2'>");
    ast.body[0].index[0].content.should.equal('foo');
    ast.body[0].value.content.should.equal('foo2');

    var ast = parser.parse("<id[2] 'foo2'>");
    ast.body[0].index[0].value.should.equal(2);
    ast.body[0].value.content.should.equal('foo2');

    var ast = parser.parse("<id[2, 'foo', 3] 'foo2'>");
    ast.body[0].index[0].value.should.equal(2);
    ast.body[0].index[1].content.should.equal('foo');
    ast.body[0].index[2].value.should.equal(3);
    ast.body[0].value.content.should.equal('foo2');
  });
  it('index errors', function() {
    var strings = [
      '<id[ "foo">',
      '<id] "foo">',
      '<id[ \'] "foo">',
      '<id{ ] "foo">',
      '<id[ } "foo">',
      '<id[" ] "["a"]>',
      '<id[a]["a"]>',
      '<id["foo""foo"] "fo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }
  });
  it('macro', function() {
    var ast = parser.parse("<id($n) {2}>");
    ast.body.length.should.equal(1);
    ast.body[0].args.length.should.equal(1);
    ast.body[0].expression.value.should.equal(2);

    ast = parser.parse("<id( $n, $m, $a ) {2}  >");
    ast.body.length.should.equal(1);
    ast.body[0].args.length.should.equal(3);
    ast.body[0].expression.value.should.equal(2);
  });
  it('macro errors', function() {
    var strings = [
      '<id (n) {2}>',
      '<id ($n) {2}>',
      '<(n) {2}>',
      '<id(() {2}>',
      '<id()) {2}>',
      '<id[) {2}>',
      '<id(] {2}>',
      '<id(-) {2}>',
      '<id(2+2) {2}>',
      '<id("a") {2}>',
      '<id(\'a\') {2}>',
      '<id(2) {2}>',
      '<_id($n) {2}>',
      '<id($n) 2}>',
      '<id($n',
      '<id($n ',
      '<id($n)',
      '<id($n) ',
      '<id($n) {',
      '<id($n) { ',
      '<id($n) {2',
      '<id($n) {2}',
      '<id(nm nm) {2}>',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    } 
  });
  it('expression', function() {
    var ast = parser.parse("<id[0 == 1 || 1] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].left.operator.token.should.equal('==');

    ast = parser.parse("<id[a == b == c] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('==');
    ast.body[0].index[0].left.operator.token.should.equal('==');

    ast = parser.parse( "<id[ a == b || c == d || e == f ] 'foo'  >");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].left.operator.token.should.equal('||');
    ast.body[0].index[0].right.operator.token.should.equal('==');

    ast = parser.parse("<id[0 && 1 || 1] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].left.operator.token.should.equal('&&');

    ast = parser.parse("<id[0 && (1 || 1)] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('&&');
    ast.body[0].index[0].right.expression.operator.token.should.equal('||');

    ast = parser.parse("<id[1 || 1 && 0] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].right.operator.token.should.equal('&&');

    ast = parser.parse("<id[1 + 2] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('+');
    ast.body[0].index[0].left.value.should.equal(1);
    ast.body[0].index[0].right.value.should.equal(2);

    ast = parser.parse("<id[1 + 2 - 3 > 4 < 5 <= a >= 'd' * 3 / q % 10] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('>=');

    ast = parser.parse("<id[! +1] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('!');
    ast.body[0].index[0].argument.operator.token.should.equal('+');
    ast.body[0].index[0].argument.argument.value.should.equal(1);

    ast = parser.parse("<id[1+2] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('+');
    ast.body[0].index[0].left.value.should.equal(1);
    ast.body[0].index[0].right.value.should.equal(2);

    ast = parser.parse("<id[(1+2)] 'foo'>");
    ast.body[0].index[0].expression.operator.token.should.equal('+');
    ast.body[0].index[0].expression.left.value.should.equal(1);
    ast.body[0].index[0].expression.right.value.should.equal(2);

    ast = parser.parse("<id[id2['foo']] 'foo2'>");
    ast.body.length.should.equal(1);
    ast.body[0].value.content.should.equal('foo2');
    ast.body[0].index[0].expression.name.should.equal('id2');
    ast.body[0].index[0].property.content.should.equal('foo');

    ast = parser.parse("<id[id['foo']] 'foo'>");
    //ast = parser.parse("<id[id['foo']]>");
    ast.body.length.should.equal(1);
    //ast.body[0].value.should.be(null);
    ast.body[0].index[0].expression.name.should.equal('id');
    ast.body[0].index[0].property.content.should.equal('foo');
  });
  it('expression errors', function() {
    var strings = [
      '<id[1+()] "foo">',
      '<id[1<>2] "foo">',
      '<id[1+=2] "foo">',
      '<id[>2] "foo">',
      '<id[1==] "foo">',
      '<id[1+ "foo">',
      '<id[2==1+] "foo">',
      '<id[2==3+4 "fpp">',
      '<id[2==3+ "foo">',
      '<id[2>>2] "foo">',
      '<id[1 ? 2 3] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    } 
  });
  it('logical expression', function() {
    var ast = parser.parse("<id[0 || 1] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].left.value.should.equal(0);
    ast.body[0].index[0].right.value.should.equal(1);

    var ast = parser.parse("<id[0 || 1 && 2 || 3] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].left.operator.token.should.equal('||');
    ast.body[0].index[0].right.value.should.equal(3);
    ast.body[0].index[0].left.left.value.should.equal(0);
    ast.body[0].index[0].left.right.left.value.should.equal(1);
    ast.body[0].index[0].left.right.right.value.should.equal(2);
    ast.body[0].index[0].left.right.operator.token.should.equal('&&');
  });
  it('logical expression errors', function() {
    var strings = [
      '<id[0 || && 1] "foo">',
      '<id[0 | 1] "foo">',
      '<id[0 & 1] "foo">',
      '<id[|| 1] "foo">',
      '<id[0 ||] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    } 
  });
  it('binary expression', function() {
    var ast = parser.parse("<id[a / b * c] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('*');
    ast.body[0].index[0].left.operator.token.should.equal('/');

    var ast = parser.parse("<id[8 * 9 % 11] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('%');
    ast.body[0].index[0].left.operator.token.should.equal('*');

    var ast = parser.parse("<id[6 + 7 - 8 * 9 / 10 % 11] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('-');
    ast.body[0].index[0].left.operator.token.should.equal('+');
    ast.body[0].index[0].right.operator.token.should.equal('%');

    var ast = parser.parse("<id[0 == 1 != 2 > 3 < 4 >= 5 <= 6 + 7 - 8 * 9 / 10 % 11] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('!=');
    ast.body[0].index[0].left.operator.token.should.equal('==');
    ast.body[0].index[0].right.operator.token.should.equal('<=');

  });
  it('binary expression errors', function() {
    var strings = [
      '<id[1 \ 2] "foo">',
      '<id[1 ** 2] "foo">',
      '<id[1 * / 2] "foo">',
      '<id[1 !> 2] "foo">',
      '<id[1 <* 2] "foo">',
      '<id[1 += 2] "foo">',
      '<id[1 %= 2] "foo">',
      '<id[1 ^ 2] "foo">',
      '<id 2 < 3 "foo">',
      '<id 2 > 3 "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('unary expression', function() {
    var ast = parser.parse("<id[! + - 1] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('!');
    ast.body[0].index[0].argument.operator.token.should.equal('+');
    ast.body[0].index[0].argument.argument.operator.token.should.equal('-');
  });
  it('unary expression errors', function() {
    var strings = [
      '<id[a ! v] "foo">',
      '<id[!] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('call expression', function() {
    var ast = parser.parse("<id[foo()] 'foo'>");
    ast.body[0].index[0].callee.name.should.equal('foo');
    ast.body[0].index[0].arguments.length.should.equal(0);

    var ast = parser.parse("<id[foo(d, e, f, g)] 'foo'>");
    ast.body[0].index[0].callee.name.should.equal('foo');
    ast.body[0].index[0].arguments.length.should.equal(4);
    ast.body[0].index[0].arguments[0].name.should.equal('d');
    ast.body[0].index[0].arguments[1].name.should.equal('e');
    ast.body[0].index[0].arguments[2].name.should.equal('f');
    ast.body[0].index[0].arguments[3].name.should.equal('g');
  });
  it('call expression errors', function() {
    var strings = [
      '<id[1+()] "foo">',
      '<id[foo(fo fo)] "foo">',
      '<id[foo(()] "foo">',
      '<id[foo(())] "foo">',
      '<id[foo())] "foo">',
      '<id[foo("ff)] "foo">',
      '<id[foo(ff")] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('member expression', function() {
    var ast = parser.parse("<id[x['d']] 'foo'>");
    ast.body[0].index[0].expression.name.should.equal('x');
    ast.body[0].index[0].property.content.should.equal('d');

    var ast = parser.parse("<id[x.d] 'foo'>");
    ast.body[0].index[0].expression.name.should.equal('x');
    ast.body[0].index[0].property.name.should.equal('d');

    var ast = parser.parse("<id[a||b.c] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('||');
    ast.body[0].index[0].right.expression.name.should.equal('b');

    ast = parser.parse("<id[ x.d ] 'foo' >");
    ast = parser.parse("<id[ x[ 'd' ] ] 'foo' >");
    ast = parser.parse("<id[ x['d'] ] 'foo' >");
    ast = parser.parse("<id[x['d']['e']] 'foo' >");
    ast = parser.parse("<id[! (a?b:c)['d']['e']] 'foo' >");
  });
  it('member expression errors', function() {
    var strings = [
      '<id[x[[]] "foo">',
      '<id[x[] "foo">',
      '<id[x[1 "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('attribute expression', function() {
    var ast = parser.parse("<id[x::['d']] 'foo'>");
    ast.body[0].index[0].expression.name.should.equal('x');
    ast.body[0].index[0].attribute.content.should.equal('d');

    var ast = parser.parse("<id[x::d] 'foo'>");
    ast.body[0].index[0].expression.name.should.equal('x');
    ast.body[0].index[0].attribute.name.should.equal('d');
  });
  it('attribute expression errors', function() {
    var strings = [
      '<id[x:::d] "foo">',
      '<id[x[::"d"]] "foo">',
      '<id[x[::::d]] "foo">',
      '<id[x:::[d]] "foo">',
      '<id[x.y::z] "foo">',
      '<id[x::y::z] "foo">',
      '<id[x.y::["z"]] "foo">',
      '<id[x::y::["z"]] "foo">',
      '<id[x::[1 "foo">',
      '<id[x()::attr1] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('parenthesis expression', function() {
    var ast = parser.parse("<id[(1 + 2) * 3] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('*');
    ast.body[0].index[0].left.expression.operator.token.should.equal('+');

    var ast = parser.parse("<id[(1) + ((2))] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('+');
    ast.body[0].index[0].right.expression.expression.value.should.equal(2);

    var ast = parser.parse("<id[(a||b).c] 'foo'>");
    ast.body[0].index[0].expression.expression.operator.token.should.equal('||');
    ast.body[0].index[0].property.name.should.equal('c');

    var ast = parser.parse("<id[!(a||b).c] 'foo'>");
    ast.body[0].index[0].operator.token.should.equal('!');
    ast.body[0].index[0].argument.expression.expression.operator.token.should.equal('||');
    ast.body[0].index[0].argument.property.name.should.equal('c');

    var ast = parser.parse("<id[a().c] 'foo'>");
    ast.body[0].index[0].expression.callee.name.should.equal('a');
    ast.body[0].index[0].property.name.should.equal('c');
  });
  it('parenthesis expression errors', function() {
    var strings = [
      '<id[1+()] "foo">',
      '<id[(+)*(-)] "foo">',
      '<id[(!)] "foo">',
      '<id[(())] "foo">',
      '<id[(] "foo">',
      '<id[)] "foo">',
      '<id[1+(2] "foo">',
      '<id[a().c.[d]()] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('primary expression', function() {
    var ast = parser.parse("<id[$foo] 'foo'>");
    ast.body[0].index[0].id.name.should.equal('foo');

    var ast = parser.parse("<id[@foo] 'foo'>");
    ast.body[0].index[0].id.name.should.equal('foo');

    var ast = parser.parse("<id[~] 'foo'>");
    ast.body[0].index[0].type.should.equal('ThisExpression');
  });
  it('literal expression', function() {
    var ast = parser.parse("<id[012] 'foo'>");
    ast.body[0].index[0].value.should.equal(12);
  });
  it('literal expression errors', function() {
    var strings = [
      '<id[012x1] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('value expression', function() {
    var ast = parser.parse("<id['foo'] 'foo'>");
    ast.body[0].index[0].content.should.equal('foo');

    ast = parser.parse("<id[{a: 'foo', b: 'foo2'}] 'foo'>");
    ast.body[0].index[0].content[0].value.content.should.equal('foo');
    ast.body[0].index[0].content[1].value.content.should.equal('foo2');
  });
  it('value expression errors', function() {
    var strings = [
      '<id[[0, 1]] "foo">',
      '<id["foo] "foo">',
      '<id[foo"] "foo">',
      '<id[["foo]] "foo">',
      '<id[{"a": "foo"}] "foo">',
      '<id[{a: 0}] "foo">',
      '<id[{a: "foo"] "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('comment', function() {
    var ast = parser.parse('/* test */');
    ast.body[0].content.should.equal(' test ');
  });
  it('comment errors', function() {
    var strings = [
      '/* foo ',
      'foo */',
      '<id /* test */ "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('identifier', function() {
    /*var ast = parser.parse("<id>");
    ast.body.length.should.equal(1);
    ast.body[0].id.name.should.equal('id');
    
    ast = parser.parse("<ID>");
    ast.body.length.should.equal(1);
    ast.body[0].id.name.should.equal('ID');*/
  });
  it('identifier errors', function() {
    var strings = [
      '<i`d "foo">',
      '<0d "foo">',
      '<09 "foo">',
      '<i!d "foo">',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }
  });

  it('throwOnErrors', function() {
    var parser = new Parser(true);

    (function() {
      var ast = parser.parse("<id<");
    }).should.throw('Expected white space at pos 3: "<id<"')

    var ast = parser.parse("<id 'value'> <id2 'value2'>");
    ast.body[1].value.content.should.equal('value2');
  });

  it('import', function() {
    var ast = parser.parse("import('./foo.lol')");
    ast.body[0].type.should.equal('ImportStatement');
    ast.body[0].uri.content.should.equal('./foo.lol');
  });
  it('import errors', function() {
    var strings = [
      '@import("foo.lol")',
      'import)(',
      'import(()',
      'import("foo.lol"]',
    ];
    for (var i in strings) {
      var ast = parser.parse(strings[i]);
      ast.body[0].type.should.equal('JunkEntry');
    }  
  });
  it('complex string', function() {
    var ast = parser.parseString("test {{ var }} test2");
    ast.content[0].content.should.equal('test ');
    ast.content[1].name.should.equal('var');
    ast.content[2].content.should.equal(' test2');

    var ast = parser.parseString("test \\\" {{ var }} test2");
    ast.content[0].content.should.equal('test " ');
    ast.content[1].name.should.equal('var');
    ast.content[2].content.should.equal(' test2');

    var ast = parser.parseString("test \\{{ var }} test2");
    ast.content.should.equal('test {{ var }} test2');
  });
  it('complex string errors', function() {
    var strings = [
      ['test {{ var ', 'Expected "}}" at pos 12: " "'],
    ];
    for (var i in strings) {
      (function() {
        var ast = parser.parseString(strings[i][0]);
      }).should.throw(strings[i][1]);
    }  
  });

  it('addEventListener', function() {
    parser.addEventListener('change', function(ev) {
    });

    (function() {
      var parser = new Parser(true);
      parser.addEventListener('change', function(ev) {
      });
    }).should.throw('Emitter not available');
  });

  it('removeEventListener', function() {
    //parser.removeEventListener('change', function(ev) {
    //});

    (function() {
      var parser = new Parser(true);
      parser.removeEventListener('change', function(ev) {
      });
    }).should.throw('Emitter not available');
  });

  describe('detecting non-complex (simple) strings', function() {
    it('should return not-complex for simple strings', function() {
      var ast = parser.parse("<id 'string'>");
      ast.body[0].value.should.have.property('isNotComplex', true);
    });
    it('should return maybe-complex for complex strings', function() {
      var ast = parser.parse("<id '{{ reference }}'>");
      should.not.exist(ast.body[0].value.isNotComplex);
    });
    it('should return maybe-complex for simple strings with braces escaped', function() {
      var ast = parser.parse("<id '\\{{ string }}'>");
      should.not.exist(ast.body[0].value.isNotComplex);

      var ast = parser.parse("<id '\\\\{{ string }}'>");
      should.not.exist(ast.body[0].value.isNotComplex);
    });
    it('should return not-complex for simple strings with braces not next to each other', function() {
      var ast = parser.parse("<id '{a{ string }}'>");
      ast.body[0].value.should.have.property('isNotComplex', true);

      var ast = parser.parse("<id '{\\{ string }}'>");
      ast.body[0].value.should.have.property('isNotComplex', true);

      var ast = parser.parse("<id '{\\\\{ string }}'>");
      ast.body[0].value.should.have.property('isNotComplex', true);
    });
  });
});
