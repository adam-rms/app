var MyPage = React.createClass({
    renderRow: function(index) {
        return (
            <Ons.ListItem key={index}>
            {`Item ${index + 1}`}
    </Ons.ListItem>
    );
    },
    renderToolbar: function() {
        return (
            <Ons.Toolbar>
            <div className='center'>My app</div>
        <div className='right'>
            <Ons.ToolbarButton>
            <Ons.Icon icon='ion-navicon, material:md-menu'></Ons.Icon>
            </Ons.ToolbarButton>
            </div>
            </Ons.Toolbar>
    );
    },

    render: function() {
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
});

ons.ready(function() {
    ReactDOM.render(<MyPage />, document.getElementById('app'));
});