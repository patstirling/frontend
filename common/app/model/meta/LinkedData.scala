package model.meta

import conf.Static

class LinkedData(
                       val `@type`: String,
                       val `@context`: String = "http://schema.org")

object LinkedData {

  import org.json4s._
  import org.json4s.native.Serialization.write

  implicit val formats = DefaultFormats + FieldSerializer[LinkedData]()

  def toJson(list: List[LinkedData]) = write(list)
}

case class Guardian(
                     name: String = "The Guardian",
                     url: String = "http://www.theguardian.com/",
                     logo: String = Static("images/favicons/152x152.png").path,
                     sameAs: List[String] = List(
                       "https://www.facebook.com/theguardian",
                       "https://twitter.com/guardian",
                       "https://plus.google.com/+theGuardian",
                       "https://www.youtube.com/user/TheGuardian"
                     )
                     ) extends LinkedData("Organization")

// https://developers.google.com/app-indexing/webmasters/server#schemaorg-markup-for-viewaction
case class WebPage(
                    `@id`: String,
                    potentialAction: PotentialAction
                    ) extends LinkedData("WebPage")

case class PotentialAction(
                            `@type`: String = "ViewAction",
                            target: String
                            )