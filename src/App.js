import React from 'react';
import ReactMapboxGl, { Layer, Feature, Marker } from 'react-mapbox-gl';
import Mapbox from 'mapbox';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import SiriusAdapter from '@edgarjeremy/sirius.adapter';
import './App.css';
import Reports from './Reports';

const accessToken = 'pk.eyJ1IjoiZWRnYXJqZXJlbXkiLCJhIjoiY2psM25nenhmMjMwYzN2cWs1NDdpeXZyMCJ9.T-PUQmpNdO3cMRGeMtfzQQ';

const mapbox = new Mapbox(accessToken);
const socket = io('localhost:1234');
const adapter = new SiriusAdapter('http://localhost', 1234, localStorage);

const Map = ReactMapboxGl({
  accessToken: accessToken
});

const [defaultCenter, defaultZoom] = [[124.9721995, 1.4579032], [12]];

const sfx = new Audio(require('./assets/fire_alarm.mp3'));
sfx.loop = true;

class App extends React.Component {

  state = {
    direction: null,
    map: null,
    center: defaultCenter,
    zoom: defaultZoom,
    report: null,
    ready: false,
    models: null,
    overlayed: true,
    popupReports: false
  }

  componentDidMount() {
    adapter.connect().then((models) => {
      this.setState({ models, ready: true });
      socket.on('panic', (report) => {
        sfx.play();
        this.drawDirection({
          latitude: report.latitude,
          longitude: report.longitude
        });
        this.setState({ report });
      });
    });
  }

  onMapReady(map) {
    this.setState({ map });
  }

  drawDirection(end) {
    const { map } = this.state;
    const start = {
      latitude: defaultCenter[1],
      longitude: defaultCenter[0]
    }
    mapbox.getDirections([
      start,
      end
    ], {
      instructions: 'html',
      alternatives: false,
      geometry: 'geojson'
    }).then((results) => {
      const { routes } = results.entity;
      const coordinates = routes[0].geometry.coordinates;
      var bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      map.fitBounds(bounds, {
        padding: 150
      });
      this.setState({
        direction: routes[0].geometry.coordinates
      });
    });
  }

  clearDirection() {
    sfx.pause();
    this.setState({ direction: null, data: null, center: defaultCenter, zoom: defaultZoom });
  }

  onRespond() {
    sfx.pause();
    socket.emit('respond');
  }

  onStart() {
    this.setState({ overlayed: false });
  }

  render() {
    const { direction, center, zoom, report, ready, overlayed, popupReports, models } = this.state;
    return (
      <div>
        {overlayed && (
          <div className="not-ready">
            <button onClick={this.onStart.bind(this)} disabled={!ready}>{ready ? 'MULAI' : 'LOADING'}</button>
          </div>
        )}
        {direction && (
          <div className="action-buttons">
            <button onClick={this.clearDirection.bind(this)}>Hapus Jalur</button>
            <button onClick={this.onRespond.bind(this)}>Jalankan Kru</button>
          </div>
        )}
        <button id="history-button" onClick={() => this.setState({ popupReports: true })}>Riwayat Laporan</button>
        {(popupReports && ready) && <Reports models={models} onClose={() => this.setState({ popupReports: false })} />}
        <Map
          onStyleLoad={this.onMapReady.bind(this)}
          style="mapbox://styles/mapbox/streets-v9"
          center={center}
          containerStyle={{
            height: '100vh',
            width: '100vw'
          }}
          zoom={zoom}
        >
          <Marker
            coordinates={center}
            anchor="bottom">
            <img style={{ width: 50, height: 50 }} src="https://cdn1.iconfinder.com/data/icons/firefighters-filled-color/300/7363545Untitled-3-512.png" />
          </Marker>
          {direction && (
            <Layer
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": "#4790E5", "line-width": 5 }}>
              <Feature coordinates={direction} />
            </Layer>
          )}
          {report && (
            <Marker
              coordinates={[report.longitude, report.latitude]}
              anchor="bottom">
              <img style={{ width: 50, height: 50 }} src={require('./assets/fire.png')} />
            </Marker>
          )}
        </Map>
      </div>
    )
  }

}

export default App;
