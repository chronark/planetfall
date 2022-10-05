





data "archive_file" "function_archive" {
  type        = "zip"
  source_dir  = "${path.module}/../svc/pinger/dist"
  output_path = "${path.module}/../svc/pinger/dist/function.zip"
}


#############################
# us-east-1
#############################

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

module "pinger_us_east_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "us-east-1"
  environment = "production"
  providers = {
    aws = aws.us_east_1
  }
}




#############################
# us-east-2
#############################

provider "aws" {
  region = "us-east-2"
  alias  = "us_east_2"
}

module "pinger_us_east_2" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "us-east-2"
  environment = "production"
  providers = {
    aws = aws.us_east_2
  }
}


#############################
# us-west-1
#############################

provider "aws" {
  region = "us-west-1"
  alias  = "us_west_1"
}

module "pinger_us_west_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "us-west-1"
  environment = "production"
  providers = {
    aws = aws.us_west_1
  }
}




#############################
# us-west-2
#############################

provider "aws" {
  region = "us-west-2"
  alias  = "us_west_2"
}

module "pinger_us_west_2" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "us-west-2"
  environment = "production"
  providers = {
    aws = aws.us_west_2
  }
}




#############################
# ap-south-1
#############################

provider "aws" {
  region = "ap-south-1"
  alias  = "ap_south_1"
}

module "pinger_ap_south_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-south-1"
  environment = "production"
  providers = {
    aws = aws.ap_south_1
  }
}


#############################
# ap-northeast-1
#############################

provider "aws" {
  region = "ap-northeast-1"
  alias  = "ap_northeast_1"
}

module "pinger_ap_northeast_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-northeast-1"
  environment = "production"
  providers = {
    aws = aws.ap_northeast_1
  }
}

#############################
# ap-northeast-2
#############################

provider "aws" {
  region = "ap-northeast-2"
  alias  = "ap_northeast_2"
}

module "pinger_ap_northeast_2" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-northeast-2"
  environment = "production"
  providers = {
    aws = aws.ap_northeast_2
  }
}

#############################
# ap-northeast-3
#############################

provider "aws" {
  region = "ap-northeast-3"
  alias  = "ap_northeast_3"
}

module "pinger_ap_northeast_3" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-northeast-3"
  environment = "production"
  providers = {
    aws = aws.ap_northeast_3
  }
}



#############################
# ap-southeast-1
#############################

provider "aws" {
  region = "ap-southeast-1"
  alias  = "ap_southeast_1"
}

module "pinger_ap_southeast_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-southeast-1"
  environment = "production"
  providers = {
    aws = aws.ap_southeast_1
  }
}

#############################
# ap-southeast-2
#############################

provider "aws" {
  region = "ap-southeast-2"
  alias  = "ap_southeast_2"
}

module "pinger_ap_southeast_2" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ap-southeast-2"
  environment = "production"
  providers = {
    aws = aws.ap_southeast_2
  }
}




#############################
# ca-central-1
#############################

provider "aws" {
  region = "ca-central-1"
  alias  = "ca_central_1"
}

module "pinger_ca_central_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "ca-central_1"
  environment = "production"
  providers = {
    aws = aws.ca_central_1
  }
}


#############################
# eu-central-1
#############################

provider "aws" {
  region = "eu-central-1"
  alias  = "eu_central_1"
}

module "pinger_eu_central_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "eu-central-1"
  environment = "production"
  providers = {
    aws = aws.eu_central_1
  }
}


#############################
# eu-west-1
#############################

provider "aws" {
  region = "eu-west-1"
  alias  = "eu_west_1"
}

module "pinger_eu_west_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "eu-west_1"
  environment = "production"
  providers = {
    aws = aws.eu_west_1
  }
}


#############################
# eu-west-2
#############################

provider "aws" {
  region = "eu-west-2"
  alias  = "eu_west_2"
}

module "pinger_eu_west_2" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "eu-west_2"
  environment = "production"
  providers = {
    aws = aws.eu_west_2
  }
}


#############################
# eu-west-3
#############################

provider "aws" {
  region = "eu-west-3"
  alias  = "eu_west_3"
}

module "pinger_eu_west_3" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "eu-west_3"
  environment = "production"
  providers = {
    aws = aws.eu_west_3
  }
}

#############################
# eu-north-1
#############################

provider "aws" {
  region = "eu-north-1"
  alias  = "eu_north_1"
}

module "pinger_eu_north_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "eu-north_1"
  environment = "production"
  providers = {
    aws = aws.eu_north_1
  }
}



#############################
# sa-east-1
#############################

provider "aws" {
  region = "sa-east-1"
  alias  = "sa_east_1"
}

module "pinger_sa_east_1" {
  source      = "./pinger"
  zip = data.archive_file.function_archive.output_path
  region      = "sa-east_1"
  environment = "production"
  providers = {
    aws = aws.sa_east_1
  }
}
