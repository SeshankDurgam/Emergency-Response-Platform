package emergencyconnect

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

/**
 * Gatling load simulation for EmergencyConnectUAE.
 *
 * Simulates the full incident lifecycle:
 *   1. Dispatcher logs in and receives a JWT
 *   2. Dispatcher reports a new incident
 *   3. Dispatcher queries the active incident list
 *   4. Dispatcher assigns a unit (dispatch endpoint)
 *   5. Responder updates the incident status to IN_PROGRESS
 *   6. Dispatcher marks assignment COMPLETED
 *   7. Incident status updated to RESOLVED
 *
 * Run via Maven:
 *   mvn gatling:test -pl load-tests/gatling
 */
class EmergencyLoadSimulation extends Simulation {

  val baseUrl: String = System.getProperty("baseUrl", "https://localhost:30443")

  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling/EmergencyConnectUAE")
    .disableFollowRedirect
    .disableCaching

  val emirates = Array("Abu Dhabi", "Dubai", "Sharjah", "Ajman", "RAK", "UAQ", "Fujairah")
  val types    = Array("FIRE", "MEDICAL", "POLICE", "ACCIDENT", "HAZMAT")
  val sevs     = Array("LOW", "MEDIUM", "HIGH", "CRITICAL")

  val feeder = Iterator.continually(Map(
    "emirate"     -> emirates(scala.util.Random.nextInt(emirates.length)),
    "incidentType"-> types(scala.util.Random.nextInt(types.length)),
    "severity"    -> sevs(scala.util.Random.nextInt(sevs.length)),
    "lat"         -> (24.0 + scala.util.Random.nextDouble() * 4).toString,
    "lon"         -> (54.0 + scala.util.Random.nextDouble() * 3).toString,
    "uniqueId"    -> java.util.UUID.randomUUID().toString.take(8)
  ))

  val loginAndReport = scenario("Incident Lifecycle")
    .feed(feeder)

    .exec(
      http("Login as dispatcher")
        .post("/api/v1/auth/login")
        .body(StringBody(
          """{"username":"dispatcher1","password":"P@ssw0rd!"}"""
        )).asJson
        .check(status.is(200))
        .check(jsonPath("$.accessToken").saveAs("jwt"))
    )
    .pause(200.milliseconds, 500.milliseconds)

    .exec(
      http("Create incident")
        .post("/api/v1/incidents")
        .header("Authorization", "Bearer #{jwt}")
        .body(StringBody(
          """{
            "title":"Load test incident #{uniqueId}",
            "description":"Automated load test",
            "incidentType":"#{incidentType}",
            "severity":"#{severity}",
            "latitude":#{lat},
            "longitude":#{lon},
            "address":"Test Street, #{emirate}",
            "emirate":"#{emirate}"
          }"""
        )).asJson
        .check(status.is(200))
        .check(jsonPath("$.id").saveAs("incidentId"))
    )
    .pause(300.milliseconds, 800.milliseconds)

    .exec(
      http("List active incidents")
        .get("/api/v1/incidents/active")
        .header("Authorization", "Bearer #{jwt}")
        .check(status.is(200))
    )
    .pause(100.milliseconds, 300.milliseconds)

    .exec(
      http("Get incident details")
        .get("/api/v1/incidents/#{incidentId}")
        .header("Authorization", "Bearer #{jwt}")
        .check(status.is(200))
    )
    .pause(200.milliseconds, 500.milliseconds)

    .exec(
      http("Smart dispatch assign")
        .post("/api/v1/dispatch/smart-assign/#{incidentId}")
        .header("Authorization", "Bearer #{jwt}")
        .check(status.in(200, 409, 503))
        .check(jsonPath("$.id").optional.saveAs("assignmentId"))
    )
    .pause(500.milliseconds, 1.second)

    .doIf(session => session.contains("assignmentId")) {
      exec(
        http("Update assignment COMPLETED")
          .patch("/api/v1/dispatch/assignments/#{assignmentId}/status")
          .header("Authorization", "Bearer #{jwt}")
          .body(StringBody("""{"status":"COMPLETED"}""")).asJson
          .check(status.in(200, 404))
      )
      .pause(200.milliseconds, 400.milliseconds)
    }

    .exec(
      http("Resolve incident")
        .patch("/api/v1/incidents/#{incidentId}/status")
        .header("Authorization", "Bearer #{jwt}")
        .body(StringBody("""{"status":"RESOLVED","notes":"Load test resolved"}""")).asJson
        .check(status.in(200, 409))
    )
    .pause(100.milliseconds, 300.milliseconds)

    .exec(
      http("Get dashboard summary")
        .get("/api/v1/incidents/dashboard/summary")
        .header("Authorization", "Bearer #{jwt}")
        .check(status.is(200))
    )

  val resourceBrowsing = scenario("Resource Browsing")
    .exec(
      http("Login as responder")
        .post("/api/v1/auth/login")
        .body(StringBody(
          """{"username":"responder1","password":"P@ssw0rd!"}"""
        )).asJson
        .check(status.is(200))
        .check(jsonPath("$.accessToken").saveAs("jwt"))
    )
    .pause(500.milliseconds)
    .repeat(5) {
      exec(
        http("List available units")
          .get("/api/v1/resources/units?status=AVAILABLE&size=20")
          .header("Authorization", "Bearer #{jwt}")
          .check(status.is(200))
      )
      .pause(1.second, 2.seconds)
      .exec(
        http("List hospitals")
          .get("/api/v1/resources/hospitals")
          .header("Authorization", "Bearer #{jwt}")
          .check(status.is(200))
      )
      .pause(1.second, 2.seconds)
    }

  setUp(
    loginAndReport.inject(
      rampUsers(10).during(30.seconds),
      constantUsersPerSec(5).during(2.minutes),
      rampUsersPerSec(5).to(20).during(1.minute),
      constantUsersPerSec(20).during(2.minutes),
      rampUsersPerSec(20).to(0).during(30.seconds)
    ),
    resourceBrowsing.inject(
      rampUsers(5).during(30.seconds),
      constantUsersPerSec(3).during(5.minutes)
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.percentile3.lte(2000),
     global.successfulRequests.percent.gte(95.0)
   )
}
