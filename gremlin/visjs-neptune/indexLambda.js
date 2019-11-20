var gremlin = require('gremlin');
var http = require('http');
var url = require('url');

exports.outnodes = [];

exports.handler = function(event, context, callback) {

    var DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
    var Graph = gremlin.structure.Graph;
    //Use wss:// for secure connections. See https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-ssl.html 
    var dc = new DriverRemoteConnection('wss://'+process.env.NEPTUNE_CLUSTER_ENDPOINT+':'+process.env.NEPTUNE_PORT+'/gremlin');
    var graph = new Graph();
    var g = graph.traversal().withRemote(dc);

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
        'Access-Control-Allow-Headers' : '*',
        "Content-Type": "application/json"
    };

    console.log("Path Parameters => "+ event.pathParameters);
    console.log("event.pathParameters.proxy => "+ event.pathParameters.proxy);
    console.log(event.pathParameters.proxy.match(/proxy/ig));

    if (event.pathParameters.proxy.match(/search/ig)) {
        g.V().has(event.queryStringParameters.nodetype,event.queryStringParameters.field, gremlin.process.P.between(event.queryStringParameters.from, event.queryStringParameters.to)).limit(20).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
            var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("Search call response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }

    if (event.pathParameters.proxy.match(/neighbours-out/ig)) {
        g.V().has(event.queryStringParameters.nodetype,'~id',event.queryStringParameters.id).out(event.queryStringParameters.edgetype).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getNeighbours response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close();
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });

    }

    if (event.pathParameters.proxy.match(/neighbours-in/ig)) {
        g.V().has(event.queryStringParameters.nodetype,'~id',event.queryStringParameters.id).in_(event.queryStringParameters.edgetype).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getNeighbours response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close();
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });

    }

}



