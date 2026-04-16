import axios from "axios";

export default ({ req }) => {

  if (typeof window === 'undefined') {
    // We are on the server (request is coming from the container), so requests should be made to http://<service-name>.<namespace-name>.svc.cluster.local
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
  } else {
    // We are on the client, so we can make a request to the API without the full URL
    return axios.create({
      baseURL: '/'
    });
  }


}