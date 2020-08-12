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
                attributes: ['id', 'username', 'nik', 'phone']
            }]
        }).then((reports) => {
            this.setState({ reports });
        });
    }

    render() {
        const { reports } = this.state;
        return (
            <div id="report-popup">
                (<a href="#" onClick={this.props.onClose}>X</a>)
                {reports && (
                    <table>
                        <thead>
                            <tr>
                                <th>Pelapor</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                                <th>Dibuat Pada</th>
                                <th>Tampilkan Di Peta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.user.username}</td>
                                    <td>{row.latitude}</td>
                                    <td>{row.longitude}</td>
                                    <td>{row.created_at}</td>
                                    <td><a href="#" onClick={() => this.props.onShow({
                                        latitude: row.latitude,
                                        longitude: row.longitude
                                    }, row)}>tampilkan</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }

}