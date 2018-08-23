import QUnit from 'qunit';
import QualityLevelList from '../src/quality-level-list';
import { representations } from './test-helpers';

QUnit.module('QualityLevelList', {
  beforeEach() {
    this.qualityLevels = new QualityLevelList();
    this.levels = representations;
  }
});

QUnit.test('Properly adds QualityLevels to the QualityLevelList', function(assert) {
  let addCount = 0;

  this.qualityLevels.on('addqualitylevel', (event) => {
    addCount++;
  });

  const expected0 = this.qualityLevels.addQualityLevel(this.levels[0]);

  assert.equal(this.qualityLevels.length, 1, 'added quality level');
  assert.equal(addCount, 1, 'emmitted addqualitylevel event');
  assert.strictEqual(this.qualityLevels[0], expected0, 'can access quality level with index');

  const expected1 = this.qualityLevels.addQualityLevel(this.levels[1]);

  assert.equal(this.qualityLevels.length, 2, 'added quality level');
  assert.equal(addCount, 2, 'emmitted addqualitylevel event');
  assert.strictEqual(this.qualityLevels[1], expected1, 'can access quality level with index');

  const expectedDuplicate = this.qualityLevels.addQualityLevel(this.levels[0]);

  assert.equal(this.qualityLevels.length, 2, 'does not add duplicate quality level');
  assert.equal(addCount, 2, 'no event emitted on dulicate');
  assert.strictEqual(this.qualityLevels[3], undefined, 'no index property defined');
  assert.strictEqual(this.qualityLevels[0], expected0, 'quality level unchanged');
  assert.strictEqual(this.qualityLevels[0], expectedDuplicate, 'adding duplicate returns same reference');
  assert.strictEqual(this.qualityLevels[1], expected1, 'quality level unchanged');
});

QUnit.test('Properly removes QualityLevels from the QualityLevelList', function(assert) {
  let removeCount = 0;
  const expected = [];

  this.levels.forEach((qualityLevel) => {
    expected.push(this.qualityLevels.addQualityLevel(qualityLevel));
  });

  this.qualityLevels.on('removequalitylevel', (event) => {
    removeCount++;
  });

  // Mock an initial selected quality level
  this.qualityLevels.selectedIndex_ = 2;

  assert.equal(this.qualityLevels.length, 4, '4 initial quality levels');

  let removed = this.qualityLevels.removeQualityLevel(expected[3]);

  assert.equal(this.qualityLevels.length, 3, 'removed quality level');
  assert.equal(removeCount, 1, 'emitted removequalitylevel event');
  assert.strictEqual(removed, expected[3], 'returned removed level');
  assert.notStrictEqual(this.qualityLevels[3], expected[3], 'nothing at index');

  removed = this.qualityLevels.removeQualityLevel(expected[1]);

  assert.equal(this.qualityLevels.length, 2, 'removed quality level');
  assert.equal(removeCount, 2, 'emitted removequalitylevel event');
  assert.strictEqual(removed, expected[1], 'returned removed level');
  assert.notStrictEqual(this.qualityLevels[1], expected[1], 'quality level not at index');
  assert.strictEqual(this.qualityLevels[this.qualityLevels.selectedIndex],
    expected[2],
    'selected index properly adjusted on quality level removal');

  removed = this.qualityLevels.removeQualityLevel(expected[3]);

  assert.equal(this.qualityLevels.length, 2, 'no quality level removed if not found');
  assert.equal(removed, null, 'returned null when nothing removed');
  assert.equal(removeCount, 2, 'no event emitted when quality level not found');

  removed = this.qualityLevels.removeQualityLevel(expected[2]);

  assert.equal(this.qualityLevels.length, 1, 'quality level removed');
  assert.equal(removeCount, 3, 'emitted removequalitylevel event');
  assert.strictEqual(removed, expected[2], 'returned removed level');
  assert.equal(this.qualityLevels.selectedIndex, -1, 'selectedIndex set to -1 when removing selected quality level');
});

QUnit.test('can get quality level by id', function(assert) {
  const expected = [];

  this.levels.forEach((qualityLevel) => {
    expected.push(this.qualityLevels.addQualityLevel(qualityLevel));
  });

  assert.strictEqual(this.qualityLevels.getQualityLevelById('0'),
    expected[0],
    'found quality level with id "0"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('1'),
    expected[1],
    'found quality level with id "1"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('2'),
    expected[2],
    'found quality level with id "2"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('3'),
    expected[3],
    'found quality level with id "3"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('4'),
    null,
    'no quality level with id "4" found');
});
