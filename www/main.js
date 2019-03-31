class PullToRefresh extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pullHookState: 'initial',
            data: this.getRandomData()
        }
    }

    getRandomName() {
        const names = ['Oscar', 'Max', 'Tiger', 'Sam', 'Misty', 'Simba', 'Coco', 'Chloe', 'Lucy', 'Missy'];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomUrl() {
        var width = 40 + Math.floor(20 * Math.random());
        var height= 40 + Math.floor(20 * Math.random());

        return `https://placekitten.com/g/${width}/${height}`;
    }

    getRandomKitten() {
        var name = this.getRandomName();

        return {
            name: this.getRandomName(),
            url: this.getRandomUrl()
        };
    }

    getRandomData() {
        const data = [];

        for (let i = 0; i < 20; i++) {
            data.push(this.getRandomKitten());
        }

        return data;
    }

    handleChange(event) {
        this.setState({
            pullHookState: event.state
        });
    }

    handleLoad(done) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.setState({
                data: this.getRandomData()
            }, done);
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className="left"><Ons.BackButton>Back</Ons.BackButton></div>
                <div className="center">Pull to refresh</div>
            </Ons.Toolbar>
        );
    }

    renderRow(data, index) {
        return (
            <Ons.ListItem key={`row-${index}`}>
                <div className='left'>
                    <img className='list__item__thumbnail' src={data.url} />
                </div>
                <div className='center'>
                    {data.name}
                </div>
            </Ons.ListItem>
        );
    }

    render() {
        let content;
        const state = this.state.pullHookState;

        if (state === 'initial') {
            content = 'Pull';
        }
        else if (state === 'preaction') {
            content = 'Release';
        }
        else {
            content = <Ons.Icon icon='spinner' spin />;
        }

        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.PullHook onChange={this.handleChange.bind(this)} onLoad={this.handleLoad.bind(this)}>
                    {content}
                </Ons.PullHook>

                <Ons.List
                    dataSource={this.state.data}
                    renderHeader={() => <Ons.ListHeader>Pull down to refresh</Ons.ListHeader>}
                    renderRow={this.renderRow}
                />
            </Ons.Page>
        );
    }
}
class SideMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    hide() {
        this.setState({
            isOpen: false
        });
    }

    show() {
        this.setState({
            isOpen: true
        });
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='left'>
                    <Ons.BackButton>Back</Ons.BackButton>
                </div>
                <div className='center'>
                    Side menu
                </div>
                <div className='right'>
                    <Ons.ToolbarButton onClick={this.show.bind(this)}>
                        <Ons.Icon icon='ion-navicon, material:md-menu' />
                    </Ons.ToolbarButton>
                </div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page>
                <Ons.Splitter>
                    <Ons.SplitterSide
                        side='right'
                        isOpen={this.state.isOpen}
                        onClose={this.hide.bind(this)}
                        onOpen={this.show.bind(this)}
                        collapse={true}
                        width={240}
                        swipeable={true}>
                        <Ons.Page>
                            <Ons.List
                                dataSource={[1, 2, 3, 4]}
                                renderHeader={() => <Ons.ListHeader>Menu</Ons.ListHeader>}
                                renderRow={(i) => <Ons.ListItem key={`menu-item-${i}`} modifier='longdivider' tappable>{'Menu item ' + i}</Ons.ListItem>}
                            />
                        </Ons.Page>
                    </Ons.SplitterSide>

                    <Ons.SplitterContent>
                        <Ons.Page renderToolbar={this.renderToolbar.bind(this)}>
                            <p style={{textAlign: 'center'}}>
                                Swipe left to open menu!
                            </p>
                        </Ons.Page>
                    </Ons.SplitterContent>
                </Ons.Splitter>
            </Ons.Page>
        );
    }
}

class Popovers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    showPopover() {
        this.setState({
            isOpen: true
        });

        setTimeout(() => {
            this.setState({
                isOpen: false
            });
        }, 1000);
    }

    getTarget() {
        return this.refs.target;
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='left'>
                    <Ons.BackButton>Back</Ons.BackButton>
                </div>
                <div className='center'>
                    Popovers
                </div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <div style={{textAlign: 'center'}}>
                    <br />
                    <div
                        onClick={this.showPopover.bind(this)}
                        style={{
                            width: '100px',
                            height: '100px',
                            display: 'inline-block',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            color: 'rgba(0, 0, 0, 0.6)',
                            lineHeight: '100px'
                        }} ref="target">
                        Click me!
                    </div>
                </div>
                <Ons.Popover
                    direction="down"
                    isOpen={this.state.isOpen}
                    getTarget={this.getTarget.bind(this)}>
                    <div style={{
                        textAlign: 'center',
                        lineHeight: '100px'
                    }}>
                        I'm a popover!
                    </div>
                </Ons.Popover>
            </Ons.Page>
        );
    }
}
class SpeedDials extends React.Component {
    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className="left"><Ons.BackButton>Back</Ons.BackButton></div>
                <div className="center">Speed dial</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <p style={{padding: '0 15px'}}>A speed dial is a Floating action button that expands into a menu.</p>

                <Ons.SpeedDial position="right bottom" direction="up">
                    <Ons.Fab>
                        <Ons.Icon icon="md-car"></Ons.Icon>
                    </Ons.Fab>
                    <Ons.SpeedDialItem>A</Ons.SpeedDialItem>
                    <Ons.SpeedDialItem>B</Ons.SpeedDialItem>
                    <Ons.SpeedDialItem>C</Ons.SpeedDialItem>
                </Ons.SpeedDial>
            </Ons.Page>
        );
    }
}

class InfiniteScroll extends React.Component {
    renderRow(index) {
        return (
            <Ons.ListItem key={index}>
                {'Item ' + (index + 1)}
            </Ons.ListItem>
        );
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='left'>
                    <Ons.BackButton>Back</Ons.BackButton>
                </div>
                <div className='center'>
                    Infinite scroll
                </div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.LazyList
                    length={10000}
                    renderRow={this.renderRow}
                    calculateItemHeight={() => ons.platform.isAndroid() ? 48 : 44}
                />
            </Ons.Page>
        );
    }
}


class FloatingActionButton extends React.Component {
    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='left'><Ons.BackButton>Back</Ons.BackButton></div>
                <div className='center'>Floating action button</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.Fab position="right bottom" ripple>
                    <Ons.Icon icon="md-phone" />
                </Ons.Fab>
            </Ons.Page>
        );
    }
}


class Dialogs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogOpen: false
        };
    }

    toggleDialog() {
        this.setState({
            dialogOpen: !this.state.dialogOpen
        });
    }

    showPopovers() {
        this.props.navigator.pushPage({comp: Popovers, props: { key: 'popovers' }});
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='center'>Dialogs</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.List
                    dataSource={[
                        <Ons.ListItem
                            key="show-dialog"
                            tappable
                            onClick={this.toggleDialog.bind(this)}>
                            Show dialog ({this.state.dialogOpen ? 'open' : 'closed'})
                        </Ons.ListItem>,
                        <Ons.ListItem key="popovers" onClick={this.showPopovers.bind(this)}>
                            Popovers
                        </Ons.ListItem>
                    ]}
                    renderHeader={() => <Ons.ListHeader>Dialogs</Ons.ListHeader>}
                    renderRow={(row) => row}
                />

                <Ons.List
                    dataSource={[
                        <Ons.ListItem
                            key="alert"
                            tappable
                            onClick={ons.notification.alert.bind(null, 'Hello, world!')}>
                            Alert dialog
                        </Ons.ListItem>,
                        <Ons.ListItem
                            key="confirmation-dialog"
                            tappable
                            onClick={ons.notification.confirm.bind(null, {
                                message: 'Do you like React?',
                                buttonLabels: ['Yes!', 'Of course!']
                            })}>
                            Confirmation dialog
                        </Ons.ListItem>,
                        <Ons.ListItem
                            key="prompt-dialog"
                            tappable
                            onClick={ons.notification.prompt.bind(null, {
                                message: 'What is your name?'
                            })}>
                            Prompt dialog
                        </Ons.ListItem>
                    ]}
                    renderHeader={() => <Ons.ListHeader>Notifications</Ons.ListHeader>}
                    renderRow={(row) => row}
                />

                <Ons.Dialog
                    isOpen={this.state.dialogOpen}
                    onCancel={this.toggleDialog.bind(this)}
                    cancelable>
                    <p style={{textAlign: 'center'}}>I am a dialog!</p>
                    <p style={{textAlign: 'center'}}>
                        <Ons.Button disabled={!this.state.dialogOpen} onClick={this.toggleDialog.bind(this)}>Close me!</Ons.Button>
                    </p>
                </Ons.Dialog>
            </Ons.Page>
        );
    }
}

class Forms extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            switchEnabled: true,
            vegetables: [
                'Tomato',
                'Cabbage',
                'Cucumber'
            ],
            selectedVegetable: 'Cabbage',
            colors: [
                'Red',
                'Blue',
                'Green',
                'Yellow'
            ],
            name: 'Andreas'
        };
    }

    handleSwitchChange(event) {
        this.setState({
            switchEnabled: event.target.checked
        });
    }

    setVegetable(vegetable) {
        this.setState({
            selectedVegetable: vegetable
        });
    }

    handleNameChange(event) {
        this.setState({
            name: event.target.value
        });
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='center'>Forms</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.List
                    dataSource={[
                        <Ons.ListItem key="switch">
                            <div className="center">
                                Switch ({this.state.switchEnabled ? 'on' : 'off'})
                            </div>
                            <div className="right">
                                <Ons.Switch
                                    checked={this.state.switchEnabled}
                                    onChange={this.handleSwitchChange.bind(this)}
                                />
                            </div>
                        </Ons.ListItem>,
                        <Ons.ListItem key="disabled-switch">
                            <div className="center">
                                Disabled switch
                            </div>
                            <div className="right">
                                <Ons.Switch disabled />
                            </div>
                        </Ons.ListItem>
                    ]}
                    renderHeader={() => <Ons.ListHeader>Switches</Ons.ListHeader>}
                    renderRow={(row) => row}
                />

                <Ons.List
                    dataSource={this.state.vegetables}
                    renderHeader={() => <Ons.ListHeader>Radio buttons</Ons.ListHeader>}
                    renderFooter={() => <Ons.ListItem>I love&nbsp;{this.state.selectedVegetable}!</Ons.ListItem>}
                    renderRow={(vegetable, index) => {
                        return (
                            <Ons.ListItem key={`vegetable-${index}`} tappable>
                                <label className="left">
                                    <Ons.Radio inputId={'radio' + index} name="vegetable" onChange={this.setVegetable.bind(this, vegetable)} checked={this.state.selectedVegetable === vegetable} />
                                </label>
                                <label htmlFor={'radio' + index} className="center">
                                    {vegetable}
                                </label>
                            </Ons.ListItem>
                        );
                    }}
                />

                <Ons.List
                    dataSource={this.state.colors}
                    renderHeader={() => <Ons.ListHeader>Checkboxes</Ons.ListHeader>}
                    renderRow={(color, index) => {
                        return (
                            <Ons.ListItem key={`color-${index}`} tappable>
                                <label className="left">
                                    <Ons.Checkbox inputId={'checkbox' + index} />
                                </label>
                                <label htmlFor={'checkbox' + index} className="center">
                                    {color}
                                </label>
                            </Ons.ListItem>
                        );
                    }}
                />

                <Ons.List
                    dataSource={[0, 1]}
                    renderHeader={() => <Ons.ListHeader>Text input</Ons.ListHeader>}
                    renderRow={(_, index) => {
                        if (index === 0) {
                            return (
                                <Ons.ListItem key={`general-${index}`}>
                                    <Ons.Input value={this.state.name} onChange={this.handleNameChange.bind(this)} placeholder="Name" float />
                                </Ons.ListItem>
                            );
                        }
                        else {
                            return (
                                <Ons.ListItem key={`general-${index}`}>
                                    Hello&nbsp;{this.state.name}!
                                </Ons.ListItem>
                            );
                        }
                    }}
                />
            </Ons.Page>
        );
    }
}
const capitalize = (str) =>
    str.replace(/^[a-z]/, (c) => c.toUpperCase());

class MyPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            counter: 5
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({
                counter: this.state.counter - 1
            }, () => {
                if (this.state.counter === 0) {
                    clearInterval(this.interval);
                    this.props.popPage();
                }
            });
        }, 400);
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    render() {
        return (
            <Ons.Page>
                <div
                    style={{
                        textAlign: 'center',
                        height: '100%'
                    }}>
          <span
              style={{
                  display: 'inline-block',
                  position: 'relative',
                  top: '50%',
                  fontSize: '26px',
                  transform: 'translate3d(0, -50%, 0)'
              }}>
            Please wait...<br />
              {this.state.counter}
          </span>
                </div>
            </Ons.Page>
        );
    }
}

class Animations extends React.Component {
    pushPage(transition) {
        const nav = this.props.navigator;

        nav.pushPage({
            comp: MyPage,
            props: {
                key: "my-page",
                popPage: () => nav.popPage({animation: transition, animationOptions: {duration: 0.8}})
            }
        }, {animation: transition, animationOptions: {duration: 0.8}});
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='center'>Animations</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <Ons.List
                    renderHeader={() => <Ons.ListHeader>Transitions</Ons.ListHeader>}
                    dataSource={['none', 'fade', 'slide', 'lift']}
                    renderRow={(row) =>
                        <Ons.ListItem
                            key={`animation-${row}`}
                            tappable
                            onClick={this.pushPage.bind(this, row)}>
                            {capitalize(row)}
                        </Ons.ListItem>
                    }
                />
            </Ons.Page>
        );
    }
}


const initialPlatform = ons.platform.isAndroid() ? 'android' : 'ios';

class Home extends React.Component {
    gotoComponent(component, key) {
        this.props.navigator.pushPage({comp: component, props: { key }});
    }

    renderToolbar() {
        return (
            <Ons.Toolbar>
                <div className='center'>Home</div>
            </Ons.Toolbar>
        );
    }

    render() {
        return (
            <Ons.Page renderToolbar={this.renderToolbar}>
                <p style={{padding: '0 15px'}}>
                    This is a kitchen sink example that shows off the React extension for Onsen UI.
                </p>

                <p style={{padding: '0 15px'}}>
                    <a href="https://onsen.io/v2/react.html" target="_blank"><strong>Official site with docs</strong></a>
                </p>

                <Ons.List
                    renderHeader={() => <Ons.ListHeader>Components</Ons.ListHeader>}
                    dataSource={[{
                        name: 'Pull to refresh',
                        component: PullToRefresh,
                        key: 'pull-to-refresh'
                    }, {
                        name: 'Infinite scroll',
                        component: InfiniteScroll,
                        key: 'infinite-scroll'
                    }, {
                        name: 'Side menu',
                        component: SideMenu,
                        key: 'side-menu'
                    }, {
                        name: 'Floating action button',
                        component: FloatingActionButton,
                        key: 'fab'
                    }, {
                        name: 'Speed dials',
                        component: SpeedDials,
                        key: 'speed-dials'
                    }]}
                    renderRow={(row) =>
                        <Ons.ListItem key={row.key} tappable onClick={this.gotoComponent.bind(this, row.component, row.key)}>
                            {row.name}
                        </Ons.ListItem>
                    }
                />
            </Ons.Page>
        );
    }
}


class Tabs extends React.Component {
    renderTabs() {
        return [
            {
                content: <Home key="home" navigator={this.props.navigator} />,
                tab: <Ons.Tab key="home" label="Home" icon="ion-ios-home-outline" />
            },
            {
                content: <Dialogs key="dialogs" navigator={this.props.navigator} />,
                tab: <Ons.Tab key="dialogs" label="Dialogs" icon="ion-ios-albums-outline" />
            },
            {
                content: <Forms key="forms" />,
                tab: <Ons.Tab key="forms" label="Forms" icon="ion-edit" />
            },
            {
                content: <Animations key="animations" navigator={this.props.navigator} />,
                tab: <Ons.Tab key="animations" label="Animations" icon="ion-film-marker" />
            }
        ];
    }

    render() {
        return (
            <Ons.Page>
                <Ons.Tabbar
                    renderTabs={this.renderTabs.bind(this)}
                />
            </Ons.Page>
        );
    }
}

class App extends React.Component {

    renderPage(route, navigator) {
        route.props = route.props || {};
        route.props.navigator = navigator;

        return React.createElement(route.comp, route.props);
    }

    render() {
        return (
            <Ons.Navigator
                initialRoute={{comp: Tabs, props: { key: 'tabs' }}}
                renderPage={this.renderPage}
            />
        );
    }
}

ons.ready(function() {
    ReactDOM.render(<App />, document.getElementById('app'));
});