tmp = '/home/me/tmp'
output = "#{tmp}/output"
input = "#{tmp}/input.rb"
output = "#{tmp}/output"
input = "#{tmp}/input.rb"

FileUtils.rm_rf(tmp)
FileUtils.mkdir_p(tmp)

yaml = <<~YAML
AllCops:
  NewCops: enable
YAML
File.write("#{tmp}/.rubocop.yml", yaml)

File.write(input, "class Input\nend")

options = { formatters: [['json', output]] } 
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = false 
begin
  runner.run([tmp])
rescue Errno::ENOENT
  # FIXME: First run fails unexpectedly
  unless retried
    retried = true
    retry
  end
  raise
end

puts JSON.pretty_generate(JSON.parse(File.read(output)))
