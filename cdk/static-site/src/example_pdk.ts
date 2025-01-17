/* eslint-disable import/no-extraneous-dependencies */
import { StaticWebsite } from '@aws/pdk/static-website';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export interface StaticWebsiteStackProps extends StackProps {
  domainName: string;
  hostedZoneId: string;
}

export class StaticWebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StaticWebsiteStackProps) {
    super(scope, id, {
      ...props,
      env: {
        ...props.env,
        region: 'us-east-1',
      },
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });
    const siteDomainName = `directory.${props.domainName}`;
    const certificate = new acm.Certificate(this, 'StaticWebsiteCertificate', {
      domainName: siteDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
    const staticWebsite = new StaticWebsite(this, 'StaticWebsite', {
      websiteContentPath: 'dist',
      distributionProps: {
        domainNames: [siteDomainName],
        certificate,
      },
    });
    new ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: siteDomainName,
      target: RecordTarget.fromAlias(new targets.CloudFrontTarget(staticWebsite.cloudFrontDistribution)),
    });
  }
}
