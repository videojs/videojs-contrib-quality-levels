import QUnit from 'qunit';
import QualityLevelList from '../src/quality-level-list';
import QualityLevel from '../src/quality-level';
import { representations } from './test-helpers';

QUnit.module('QualityLevelList', {
  beforeEach() {
    this.qualityLevels = new QualityLevelList();
    this.levels = representations.map((rep) => new QualityLevel(rep));
  }
});

QUnit.test('Properly adds QualityLevels to the QualityLevelList', function(assert) {
  let addCount = 0;

  this.qualityLevels.on('addqualitylevel', (event) => {
    addCount++;
  });

  this.qualityLevels.addQualityLevel(this.levels[0]);

  assert.equal(this.qualityLevels.length, 1, 'added quality level');
  assert.equal(addCount, 1, 'emmitted addqualitylevel event');
  assert.strictEqual(this.qualityLevels[0], this.levels[0], 'can access quality level with index');

  this.qualityLevels.addQualityLevel(this.levels[1]);

  assert.equal(this.qualityLevels.length, 2, 'added quality level');
  assert.equal(addCount, 2, 'emmitted addqualitylevel event');
  assert.strictEqual(this.qualityLevels[1], this.levels[1], 'can access quality level with index');

  this.qualityLevels.addQualityLevel(this.levels[0]);

  assert.equal(this.qualityLevels.length, 2, 'does not add duplicate quality level');
  assert.equal(addCount, 2, 'no event emitted on dulicate');
  assert.strictEqual(this.qualityLevels[3], undefined, 'no index property defined');
  assert.strictEqual(this.qualityLevels[0], this.levels[0], 'quality level unchanged');
  assert.strictEqual(this.qualityLevels[1], this.levels[1], 'quality level unchanged');
});

QUnit.test('Properly removes QualityLevels from the QualityLevelList', function(assert) {
  let removeCount = 0;

  this.levels.forEach((qualityLevel) => {
    this.qualityLevels.addQualityLevel(qualityLevel);
  });

  this.qualityLevels.on('removequalitylevel', (event) => {
    removeCount++;
  });

  // Mock an initial selected quality level
  this.qualityLevels.selectedIndex_ = 2;

  assert.equal(this.qualityLevels.length, 4, '4 initial quality levels');

  this.qualityLevels.removeQualityLevel(this.levels[3]);

  assert.equal(this.qualityLevels.length, 3, 'removed quality level');
  assert.equal(removeCount, 1, 'emitted removequalitylevel event');
  assert.notStrictEqual(this.qualityLevels[3], this.levels[3], 'nothing at index');

  this.qualityLevels.removeQualityLevel(this.levels[1]);

  assert.equal(this.qualityLevels.length, 2, 'removed quality level');
  assert.equal(removeCount, 2, 'emitted removequalitylevel event');
  assert.notStrictEqual(this.qualityLevels[1], this.levels[1], 'quality level not at index');
  assert.strictEqual(this.qualityLevels[this.qualityLevels.selectedIndex],
                     this.levels[2],
                     'selected index properly adjusted on quality level removal');

  this.qualityLevels.removeQualityLevel(this.levels[3]);

  assert.equal(this.qualityLevels.length, 2, 'no quality level removed if not found');
  assert.equal(removeCount, 2, 'no event emitted when quality level not found');

  this.qualityLevels.removeQualityLevel(this.levels[2]);

  assert.equal(this.qualityLevels.length, 1, 'quality level removed');
  assert.equal(removeCount, 3, 'emitted removequalitylevel event');
  assert.equal(this.qualityLevels.selectedIndex, -1, 'selectedIndex set to -1 when removing selected quality level');
});

QUnit.test('can get quality level by id', function(assert) {
  this.levels.forEach((qualityLevel) => {
    this.qualityLevels.addQualityLevel(qualityLevel);
  });

  assert.strictEqual(this.qualityLevels.getQualityLevelById('0'),
                     this.levels[0],
                     'found quality level with id "0"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('1'),
                     this.levels[1],
                     'found quality level with id "1"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('2'),
                     this.levels[2],
                     'found quality level with id "2"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('3'),
                     this.levels[3],
                     'found quality level with id "3"');
  assert.strictEqual(this.qualityLevels.getQualityLevelById('4'),
                     null,
                     'no quality level with id "4" found');
});
