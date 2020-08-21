import React from 'react';
import moment from 'moment';
import 'moment/locale/id';

export default class Reports extends React.Component {

    state = {
        reports: null
    }

    componentDidMount() {
        const { models } = this.props;
        models.Report.collection({
            attributes: ['id', 'latitude', 'longitude', 'created_at', 'updated_at', 'verified', 'user_id'],
            include: [{
                model: 'User',
                attributes: ['id', 'username', 'nik', 'phone']
            }],
            order: [['created_at', 'desc']]
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
                                <th>Terverifikasi</th>
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
                                    <td>{row.verified === null ? 'Belum Terverifikasi' : (row.verified ? 'Terverifikasi' : 'Hoax')}</td>
                                    <td>{moment(row.created_at).format('Do MMMM YYYY, h:mm:ss a')}</td>
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