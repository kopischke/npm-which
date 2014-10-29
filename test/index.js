"use strict"

var test = require('tape')

var path = require('path')

var npmWhich = require('../')

var level0 = path.join(__dirname, 'fixtures', 'level0')
var level1 = path.join(level0, 'node_modules', 'level1')
var level2 = path.join(level1, 'node_modules', 'level2')

var level = [level0, level1, level2]
var binPath = level.map(function(levelPath) {
  return path.join(levelPath, "node_modules", ".bin")
})

test('includes all .bin dirs in all parent node_modules folders', function(t) {
  t.test('no nesting', function(t) {
    var level1Bin = npmWhich.sync('level1', {cwd: level[0]})
    t.equal(level1Bin, path.join(binPath[0], 'level1'))
    t.end()
  })

  t.test('nesting', function(t) {
    var level1Bin = npmWhich.sync('level1', {cwd: level[1]})
    t.equal(level1Bin, path.join(binPath[0], 'level1'))
    var level2Bin = npmWhich.sync('level2', {cwd: level[1]})
    t.equal(level2Bin, path.join(binPath[1], 'level2'))
    t.end()
  })

  t.test('more nesting', function(t) {
    var level1Bin = npmWhich.sync('level1', {cwd: level[2]})
    t.equal(level1Bin, path.join(binPath[0], 'level1'))
    var level2Bin = npmWhich.sync('level2', {cwd: level[2]})
    t.equal(level2Bin, path.join(binPath[1], 'level2'))
    t.end()
  })

  t.end()
})

test('which.sync does not mutate PATH', function(t) {
  var before = process.env.PATH
  var level1Bin = npmWhich.sync('level1', {env: {PATH: binPath[0]}})
  var after = process.env.PATH
  t.deepEqual(before, after)
  t.end()
})

test('which.sync does not mutate PATH after failed find', function(t) {
  var before = process.env.PATH
  t.throws(function() {
    var level1Bin = npmWhich.sync('asdasd', {env: {PATH: binPath[0]}})
  })
  var after = process.env.PATH
  t.deepEqual(before, after)
  t.end()
})

test('which does not mutate PATH', function(t) {
  var before = process.env.PATH
  var level1Bin = npmWhich('level1', {env: {PATH: binPath[0]}}, function(err) {
    t.ifError(err)
    var after = process.env.PATH
    t.deepEqual(before, after)
    t.end()
  })
})

test('which does not mutate PATH after failed find', function(t) {
  var before = process.env.PATH
  var level1Bin = npmWhich('asdasd', {cwd: 'asdasdb/jhbhj'}, function(err) {
    t.ok(err)
    var after = process.env.PATH
    t.deepEqual(before, after)
    t.end()
  })
})

test('can find path with bad cwd', function(t) {
  var before = process.env.PATH
  var level1Bin = npmWhich('node', {cwd: '/asdasdb/jhbhj'}, function(err, path) {
    t.ifError(err)
    t.ok(path)
    t.equal(path.split('/').pop(), 'node')
    var after = process.env.PATH
    t.deepEqual(before, after)
    t.end()
  })
})

test('which does not mutate PATH with bad cmd & cwd', function(t) {
  var before = process.env.PATH
  var level1Bin = npmWhich('asdasd', {cwd: 'asdasdb/jhbhj'}, function(err) {
    t.ok(err)
    var after = process.env.PATH
    t.deepEqual(before, after)
    t.end()
  })
})

test('which does not mutate PATH with bad cwd/cmd on "windows"', function(t) {
  process.platform = "win32"
  var before = process.env.PATH
  var level1Bin = npmWhich('asdasd', {cwd: 'asdasdb/jhbhj'}, function(err) {
    t.ok(err)
    var after = process.env.PATH
    t.deepEqual(before, after)
    t.end()
  })
})
