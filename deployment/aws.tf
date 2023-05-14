





data "archive_file" "function_archive" {
  type        = "zip"
  source_file = "${path.module}/../apps/proxy/dist/cmd/aws/main"
  output_path = "${path.module}/../apps/proxy/dist/cmd/aws/function.zip"
}


#############################
# us-east-1
#############################

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

module "check_runner_us_east_1" {
  source = "./pinger"
  zip = {
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "us-east-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_us_east_2" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "us-east-2"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_us_west_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "us-west-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_us_west_2" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "us-west-2"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_south_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-south-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_northeast_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-northeast-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_northeast_2" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-northeast-2"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_northeast_3" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-northeast-3"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_southeast_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-southeast-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ap_southeast_2" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-southeast-2"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_ca_central_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ca-central-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_eu_central_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-central-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_eu_west_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-west-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_eu_west_2" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-west_2"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_eu_west_3" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-west_3"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_eu_north_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-north-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
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

module "check_runner_sa_east_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "sa-east-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.sa_east_1
  }
}



#############################
# me-south-1
#############################

provider "aws" {
  region = "me-south-1"
  alias  = "me_south_1"
}

module "check_runner_me_south_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "me-south-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.me_south_1
  }
}


#############################
# ap-southeast-3
#############################

provider "aws" {
  region = "ap-southeast-3"
  alias  = "ap_southeast_3"
}

module "check_runner_ap_southeast_3" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-southeast_3"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.ap_southeast_3
  }
}


#############################
# af-south-1
#############################

provider "aws" {
  region = "af-south-1"
  alias  = "af_south_1"
}

module "check_runner_af_south_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "af-south-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.af_south_1
  }
}


#############################
# ap-east-1
#############################

provider "aws" {
  region = "ap-east-1"
  alias  = "ap_east_1"
}

module "check_runner_ap_east_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "ap-east-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.ap_east_1
  }
}

#############################
# eu-south-1
#############################

provider "aws" {
  region = "eu-south-1"
  alias  = "eu_south_1"
}

module "check_runner_eu_south_1" {
  source = "./pinger"
  zip = {
    # path = "../apps/proxy-aws/dist/function.v2.zip"
    # hash="v2"
    path = data.archive_file.function_archive.output_path
    hash = data.archive_file.function_archive.output_base64sha256
  }
  region      = "eu-south-1"
  environment = "production"
  check_runner_signing_key_public = var.check_runner_signing_keys.public
  providers = {
    aws = aws.eu_south_1
  }
}



# #############################
# # ap-south-2
# #############################

# provider "aws" {
#   region = "ap-south-2"
#   alias  = "ap_south_2"
# }

# module "check_runner_ap_south_2" {
#   source = "./pinger"
#   zip = {
#     path = data.archive_file.function_archive.output_path
#     hash = data.archive_file.function_archive.output_base64sha256
#   }
#   region      = "ap-south-2"
#   environment = "production"
# check_runner_signing_keys = var.check_runner_signing_keys
#   providers = {
#     aws = aws.ap_south_2
#   }
# }





# #############################
# # eu-south-2
# #############################

# provider "aws" {
#   region = "eu-south-2"
#   alias  = "eu_south_2"
# }

# module "check_runner_eu_south_2" {
#   source = "./pinger"
#   zip = {
#     path = data.archive_file.function_archive.output_path
#     hash = data.archive_file.function_archive.output_base64sha256
#   }
#   region      = "eu-south-2"
#   environment = "production"
# check_runner_signing_keys = var.check_runner_signing_keys
#   providers = {
#     aws = aws.eu_south_2
#   }
# }




# #############################
# # eu-central-2
# #############################

# provider "aws" {
#   region = "eu-central-2"
#   alias  = "eu_central_2"
# }

# module "check_runner_eu_central_2" {
#   source = "./pinger"
#   zip = {
#     path = data.archive_file.function_archive.output_path
#     hash = data.archive_file.function_archive.output_base64sha256
#   }
#   region      = "eu-central-2"
#   environment = "production"
# check_runner_signing_keys = var.check_runner_signing_keys
#   providers = {
#     aws = aws.eu_central_2
#   }
# }



