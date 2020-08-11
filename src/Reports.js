import React from 'react';

export default class Reports extends React.Component {

    state = {
        reports: null
    }

    componentDidMount() {
        const { models } = this.props;
        models.Report.collection({
            attributes: ['id', 'latitude', 'longitude', 'created_at', 'updated_at', 'user_id'],
            include: [{
                model: 'User',
                attributes: ['id', 'username', 'nik']
            }]
        }).then((reports) => {
            this.setState({ reports });
        });
    }

    render() {
        const { reports } = this.state;
        return (
            <div id="report-popup">
                (<a href="#" onClick={this.props.onClose}>tutup</a>)
                {reports && (
                    <table>
                        <thead>
                            <tr>
                                <th>Pelapor</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Dibuat Pada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.user.username}</td>
                                    <td>{row.latitude}</td>
                                    <td>{row.longitude}</td>
                                    <td>{row.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }

}