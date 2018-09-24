const e = React.createElement;

const kudosuRequirements = [200, 150, 150, 150];
const mapRequirements = [4, 3, 3, 3];
const months = 3;

const modScore = (mapCount, mode) =>
    Math.log(1 + mapCount) / Math.log(Math.sqrt(1 + mapRequirements[mode]))
    - 2 * (1 + mapRequirements[mode]) / (1 + mapCount);

const toOrder = n => ['First', 'Second', 'Third'][n];

function MapCountInput(props) {
    return [
        e(
            'p',
            null,
            toOrder(props.month) + ' month'
        ),
        e(
            'input',
            {
                onInput: props.onInput,
                placeholder: 'Amount of maps modded',
                type: 'text',
                x_month: props.month,
            }
        )
    ];
}

class Page extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            kudosuCount: props.kudosuCount,
            mapCounts: props.mapCounts,
            mode: props.mode,
            modScores: props.modScores,
        };

        this.checkStatus = this.checkStatus.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.onKudosuInput = this.onKudosuInput.bind(this);
        this.onMapCountInput = this.onMapCountInput.bind(this);

        this.checkStatus();
    }

    componentDidUpdate(_, state) {
        if (state.mapCounts.some((m, i) => m !== this.state.mapCounts[i]) || state.kudosuCount !== this.state.kudosuCount) {
            this.checkStatus();
        }
    }

    render() {
        return [
            e(
                'p',
                null,
                'Kudosu earned'
            ),
            e(
                'input',
                {
                    onInput: this.onKudosuInput,
                    placeholder: 'Kudosu earned',
                    type: 'text',
                }
            ),
            Array.from(Array(months), (_, index) => e(
                MapCountInput,
                {
                    month: index,
                    onInput: this.onMapCountInput,
                }
            )),
            e(
                'div',
                {
                    class: 'results',
                },
                e('p', null, 'You are ' + (this.state.status ? '' : 'not ') + 'eligible to apply for BN'),
                e('p', null, 'Total mod score: ' + this.state.modScores.reduce((a, b) => a + b, 0) + this.checkOrX('modScores')),
                e('p', null, 'Kudosu count: ' + this.state.kudosuCount + this.checkOrX('kudosu'))
            )
        ];
    }

    checkStatus(component) {
        if (component === 'kudosu') {
            return this.state.kudosuCount >= kudosuRequirements[this.state.mode];
        }

        if (component === 'modScores') {
            return this.state.modScores.reduce((a, b) => a + b, 0) >= 0;
        }

        this.setState({
            status: this.checkStatus('kudosu') && this.checkStatus('modScores'),
        });
    }

    checkOrX(component) {
        return ' ' + (this.checkStatus(component) ? 'Yay' : 'X');
    }

    onKudosuInput(e) {
        e.preventDefault();

        this.setState({
            kudosuCount: parseInt(e.target.value),
        })
    }

    onMapCountInput(e) {
        e.preventDefault();

        let month = parseInt(e.target.getAttribute('x_month'));
        let count = parseInt(e.target.value);
        if (isNaN(count)) {
            count = 0;
        }

        this.setState(state => {
            let mapCounts = [...state.mapCounts];
            mapCounts[month] = count;

            let modScores = [...state.modScores];
            modScores[month] = modScore(count, state.mode);

            return {
                mapCounts: mapCounts,
                modScores: modScores,
            };
        });
    }
}
