define([
    'react',
    'lodash/functions/compose',
    'lodash/functions/partialRight',
    'lodash/collections/contains',
    'lodash/collections/shuffle',
    'lodash/collections/filter',
    'lodash/collections/reduce',
    'lodash/arrays/rest',
    'lodash/arrays/first',
    'lodash/arrays/compact',
    'lodash/collections/map',
    'common/views/svgs',
    './clue-input',
    './clue-preview',
    './ring',
    '../helpers'
], function (
    React,
    compose,
    partialRight,
    contains,
    shuffle,
    filter,
    reduce,
    rest,
    first,
    compact,
    map,
    svgs,
    ClueInput,
    CluePreview,
    Ring,
    helpers) {
    var flow = function () {
        var partialFns = map(Array.prototype.slice.apply(arguments), function (call) {
            var fn = first(call);
            var args = rest(call);
            return partialRight.apply(null, [fn].concat(args));
        });
        return function () {
            var args = Array.prototype.slice.apply(arguments);
            var seedValue = first(partialFns).apply(null, args);
            return reduce(rest(partialFns), function (acc, fn) {
                return fn(acc);
            }, seedValue);
        };
    };

    var AnagramHelper = React.createClass({
        getInitialState: function () {
            return {
                clueInput: '',
                showInput: true
            };
        },

        componentWillReceiveProps: function (next) {
            // reset on clue change
            if (next.clue !== this.props.focussedEntry) {
                this.reset();
            }
        },

        reset: function () {
            if (this.state.clueInput) {
                this.setState({
                    clueInput: '',
                    showInput: true
                });
            }
        },

        shuffle: function () {
            if (this.canShuffle()) {
                this.setState({
                    showInput: false
                });
            }
        },

        canShuffle: function () {
            return this.state.clueInput &&
                this.state.clueInput.length > 0;
        },

        /**
         * Shuffle the letters in the user's input.
         *
         * First, create an array of input characters that have already been entered
         * into the grid. Then build a new collection of letters, using the first
         * array to flag letters that are already entered in the puzzle, and
         * shuffle it.
         *
         * @param  {String}   word     word to shuffle
         * @param  {[Object]} entries  array of entries (i.e. grid cells)
         * @return {[Object]}          array of shuffled letters
         */
        shuffleWord: function (word, entries) {
            var wordEntries = flow(
                [map, function (entry) {
                    return entry.value.toLowerCase();
                }],
                [filter, function (entry) {
                    return contains(word, entry);
                }],
                [compact]
            )(entries).sort();

            return shuffle(reduce(word.trim().split('').sort(), function (acc, letter) {
                var entered = acc.entries[0] === letter.toLowerCase();

                return {
                    letters: acc.letters.concat({
                        value: letter,
                        entered: entered
                    }),
                    entries: entered ? rest(acc.entries) : acc.entries
                };
            }, {
                letters: [],
                entries: wordEntries
            }).letters);
        },

        onClueInput: function (text) {
            if (!/\s|\d/g.test(text)) {
                this.setState({
                    clueInput: text
                });
            }
        },

        render: function () {
            /* jscs:disable disallowDanglingUnderscores */
            var closeIcon = {
                __html: svgs('closeCentralIcon')
            };
            /* jscs:enable disallowDanglingUnderscores */
            var clue = helpers.getAnagramClueData(this.props.entries, this.props.focussedEntry);
            var cells = helpers.cellsForClue(this.props.entries, this.props.focussedEntry);
            var entries = map(cells, function (coords) {
                return this.props.grid[coords.x][coords.y];
            }, this);
            var letters = this.shuffleWord(this.state.clueInput, entries);

            var inner = this.state.showInput ?
                React.createElement(ClueInput, {
                    value: this.state.clueInput,
                    clue: clue,
                    onChange: this.onClueInput,
                    onEnter: this.shuffle
                }) :
                React.createElement(Ring, {
                    letters: letters
                });

            return React.createElement('div', {
                    className: 'crossword__anagram-helper-outer'
                },
                React.createElement('div', {
                    className: 'crossword__anagram-helper-inner'
                }, inner),
                React.createElement('button', {
                    className: 'button button--large button--tertiary crossword__anagram-helper-close',
                    onClick: this.props.close,
                    dangerouslySetInnerHTML: closeIcon
                }),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.state.clueInput && 'button--tertiary'),
                    onClick: this.reset
                }, 'start again'),
                React.createElement('button', {
                    className: 'button button--large ' + (!this.canShuffle() && 'button--tertiary'),
                    onClick: this.shuffle
                }, 'shuffle'),
                React.createElement(CluePreview, {
                    clue: clue,
                    entries: entries,
                    letters: letters,
                    hasShuffled: !this.state.showInput
                })
            );
        }
    });

    return AnagramHelper;
});
