class HelloMessage extends React.Component {
    render() {
        return <div>Hello <x-search>{this.props.name}</x-search>!</div>;
    }
}