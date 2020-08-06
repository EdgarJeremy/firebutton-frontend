import React from 'react';
import ReactMapboxGl, { Layer, Feature, Marker } from 'react-mapbox-gl';
import Mapbox from 'mapbox';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import './App.css';

const accessToken = 'pk.eyJ1IjoiZWRnYXJqZXJlbXkiLCJhIjoiY2psM25nenhmMjMwYzN2cWs1NDdpeXZyMCJ9.T-PUQmpNdO3cMRGeMtfzQQ';

const mapbox = new Mapbox(accessToken);
const socket = io('localhost:1234');

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
    data: null
  }

  componentDidMount() {
    socket.on('panic', (data) => {
      const { user, position } = data;
      sfx.play();
      this.drawDirection({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      this.setState({ data });
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

  render() {
    const { direction, center, zoom, data } = this.state;
    return (
      <div>
        {direction && (
          <div className="action-buttons">
            <button onClick={this.clearDirection.bind(this)}>Hapus Jalur</button>
            <button onClick={this.onRespond.bind(this)}>Jalankan Kru</button>
          </div>
        )}
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
          {data && (
            <Marker
              coordinates={[data.position.coords.longitude, data.position.coords.latitude]}
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
