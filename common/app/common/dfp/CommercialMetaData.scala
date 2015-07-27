package common.dfp

import common.Edition
import model.Tag

trait PossibleAdvertisementFeature {

  def tags: Seq[Tag]
  def section: String

  lazy val isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(tags, Some(section))
}

trait CommercialMetaData extends PossibleAdvertisementFeature {

  def id: String

  lazy val isFoundationSupported: Boolean =
    DfpAgent.isFoundationSupported(tags, Some(section))

  lazy val isExpiredAdvertisementFeature: Boolean =
    DfpAgent.isExpiredAdvertisementFeature(id, tags, Some(section))

  lazy val sponsorshipTag: Option[Tag] = DfpAgent.sponsorshipTag(tags, Some(section))

  lazy val hasMultipleSponsors: Boolean = DfpAgent.hasMultipleSponsors(tags)

  lazy val hasMultipleFeatureAdvertisers: Boolean = DfpAgent.hasMultipleFeatureAdvertisers(tags)

  lazy val sponsor: Option[String] = DfpAgent.getSponsor(tags)

  lazy val sponsorshipType: Option[String] = {
    if (isSponsored(None)) {
      Option("sponsoredfeatures")
    } else if (isAdvertisementFeature) {
      Option("advertisement-features")
    } else if (isFoundationSupported) {
      Option("foundation-features")
    } else {
      None
    }
  }

  def adUnitSuffix = section

  def hasPageSkin(edition: Edition) = false

  def isSponsored(maybeEdition: Option[Edition]): Boolean =
    DfpAgent.isSponsored(tags, Some(section), maybeEdition)

  def hasInlineMerchandise: Boolean = DfpAgent.hasInlineMerchandise(tags)

  def isSurging: Seq[Int] = Seq(0)

  def sizeOfTakeoverAdsInSlot(slot: AdSlot, edition: Edition): Seq[AdSize] = Nil

  def hasAdInBelowTopNavSlot(edition: Edition) = false

  def omitMPUsFromContainers(edition: Edition) = false
}
